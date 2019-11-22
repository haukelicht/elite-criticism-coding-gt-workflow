import json
import sys
from s3_helper import S3Client


def lambda_handler(event, context):
    """This is a sample Annotation Consolidation Lambda for custom labeling jobs. It takes all worker responses for the
    item to be labeled, and output a consolidated annotation.


    Parameters
    ----------
    event: dict, required
        Content of an example event

        {
            "version": "2018-10-16",
            "labelingJobArn": <labelingJobArn>,
            "labelCategories": [<string>],  # If you created labeling job using aws console, labelCategories will be null
            "labelAttributeName": <string>,
            "roleArn" : "string",
            "payload": {
                "s3Uri": <string>
            }
            "outputConfig":"s3://<consolidated_output configured for labeling job>"
         }


        Content of payload.s3Uri
        [
            {
                "datasetObjectId": <string>,
                "dataObject": {
                    "s3Uri": <string>,
                    "content": <string>
                },
                "annotations": [{
                    "workerId": <string>,
                    "annotationData": {
                        "content": <string>,
                        "s3Uri": <string>
                    }
               }]
            }
        ]

        As SageMaker product evolves, content of event object & payload.s3Uri will change. For a latest version refer following URL

        Event doc: https://docs.aws.amazon.com/sagemaker/latest/dg/sms-custom-templates-step3.html

    context: object, required
        Lambda Context runtime methods and attributes

        Context doc: https://docs.aws.amazon.com/lambda/latest/dg/python-context-object.html

    Returns
    ------
    consolidated_output: dict
        AnnotationConsolidation

        [
           {
                "datasetObjectId": <string>,
                "consolidatedAnnotation": {
                    "content": {
                        "<label attribute name>": {
                            "annotationsFromAllWorkers": [...]
                        }
                    }
                }
            }
        ]

        Return doc: https://docs.aws.amazon.com/sagemaker/latest/dg/sms-custom-templates-step3.html
    """

    # Event received
    print("Received event: " + json.dumps(event, indent=None))

    labeling_job_arn = event["labelingJobArn"]
    label_attribute_name = event["labelAttributeName"]

    label_categories = None
    if "label_categories" in event:
        label_categories = event["labelCategories"]

    payload = event["payload"]
    role_arn = event["roleArn"]

    output_config = None  # Output s3 location. You can choose to write your annotation to this location
    if "outputConfig" in event:
        output_config = event["outputConfig"]

    # If you specified a KMS key in your labeling job, you can use the key to write
    # consolidated_output to s3 location specified in outputConfig.
    kms_key_id = None
    if "kmsKeyId" in event:
        kms_key_id = event["kmsKeyId"]

    # Create s3 client object
    s3_client = S3Client(role_arn, kms_key_id)

    # Perform consolidation
    return consolidate_annotations(labeling_job_arn, payload, label_attribute_name, s3_client)


def consolidate_annotations(labeling_job_arn, payload, label_attribute_name, s3_client):
    """Core Logic for consolidation

    Parameters
    -----------
    labeling_job_arn: str, labeling job ARN
    payload: dict
        payload data for consolidation
    label_attribute_name: str (or list of strings)
        identifiers for labels in output JSON
    s3_client: S3 helper class

    Returns
    ----------
    consolidated_output: list

        [
            {
                "datasetObjectId": "0",
                "consolidatedAnnotation": {
                    "content": {
                        "attribute-1": {"annotationsFromAllWorkers": [<dictionaries with labels assigned by workers to attribute 1>],
                        "attribute-2": {"annotationsFromAllWorkers": [<dictionaries with labels assigned by workers to attribute 2>],
                        ...
                    }
                }
            },
            {
                "datasetObjectId": "1",
                "consolidatedAnnotation": {
                    "content": {
                        "attribute-1": {"annotationsFromAllWorkers": [<dictionaries with labels assigned by workers to attribute 1>],
                        "attribute-2": {"annotationsFromAllWorkers": [<dictionaries with labels assigned by workers to attribute 2>],
                        ...
                    }
                }
            },
            ...
        ]        

    """

    # Extract payload data
    if "s3Uri" in payload:
        s3_ref = payload["s3Uri"]
        payload = json.loads(s3_client.get_object_from_s3(s3_ref))

    # Payload data contains a list of data objects.
    # Iterate over it to consolidate annotations for individual data object.
    consolidated_output = []
    success_count = 0  # Number of data objects that were successfully consolidated
    failure_count = 0  # Number of data objects that failed in consolidation

    for p in range(len(payload)):
        response = None
        try:
            dataset_object_id = payload[p]['datasetObjectId']
            log_prefix = "[{}] data object id [{}] :".format(labeling_job_arn, dataset_object_id)
            print("{} Consolidating annotations BEGIN ".format(log_prefix))

            annotations = payload[p]['annotations']
            print("{} Received Annotations from {} workers".format(log_prefix, len(annotations)))

            content = dict()
            if isinstance(label_attribute_name, str):
                content[label_attribute_name] = parse_annotations(annotations, label_attribute_name, log_prefix)
            elif isinstance(label_attribute_name, list):
                for attr in label_attribute_name:
                    content[attr] = parse_annotations(annotations, attr, log_prefix)
            else:
                print(
                    "{} Received Annotations could not be parsed".format(log_prefix))

            # Build consolidation response object for an individual data object
            response = {
                "datasetObjectId": dataset_object_id,
                "consolidatedAnnotation": {
                    "content": content
                }
            }

            success_count += 1
            print("{} Consolidating annotations END ".format(log_prefix))

            # Append individual data object response to the list of responses.
            if response is not None:
                consolidated_output.append(response)

        except:
            failure_count += 1
            print(" Consolidation failed for data object {}".format(p))
            print(" Unexpected error: Consolidation failed." + str(sys.exc_info()[0]))

    print("{} Consolidation Complete (successes: {}, failures: {})".format(log_prefix, success_count, failure_count))

    return consolidated_output


def parse_annotations(annotations, attribute_name, log_prefix):
    """Annotations parser
    Parameters
    ----------
    annotations: dict
        the annotations dictionary parsed from the payload of a consolidation request 
    attribute_name: str
        the name of the label attribute for which to extract annotations
    log_prefix: str
        a string prefixed to all log messages printed

    Returns
    ----------
    annotations_from_all_workers: dict
        a dictionary that maps a list of worker-annotation dicts to the key 'annotationsFromAllWorkers' 

        {
            "annotationsFromAllWorkers": [
                {
                    "worker_id": "<worker 1 ID>", 
                    "label": "<label assigned by worker 1 to attribute>"
                }, 
                {
                    "worker_id": "<worker 2 ID>", 
                    "label": "<label assigned by worker 2 to attribute>"
                },
                ... 
            ]
        }
    """

    consolidated_annotation = []

    for i in range(len(annotations)):
        out = {}
        out['workerId'] = annotations[i]["workerId"]
        annotation_content = annotations[i]['annotationData'].get('content')
        annotation_s3_uri = annotations[i]['annotationData'].get('s3uri')
        annotation = annotation_content if annotation_s3_uri is None else s3_client.get_object_from_s3(
            annotation_s3_uri)
        annotation_i = json.loads(annotation)

        if attribute_name not in annotation_i:
            print("{} Received Annotations from worker [{}] does not contain attribute [{}]".format(log_prefix, out['workerId'], attribute_name))
            out['annotation'] = {}
        else:
            out['annotation'] = parse_annotation_attribute(annotation_i.get(attribute_name))
            print("{} Received Annotations from worker [{}] for attribute [{}] is [{}]".format(log_prefix, out['workerId'], attribute_name, out['annotation']))

        consolidated_annotation.append(out)

    return {"annotationsFromAllWorkers": consolidated_annotation}


def parse_annotation_attribute(value):
    try:
        x = json.loads(value)
    except:
        return value
    else:
        if not isinstance(x, dict):
            return parse_annotation_attribute(x)
        out = {}
        for k, v in x.items():
            out[k] = parse_annotation_attribute(v)

        return out
