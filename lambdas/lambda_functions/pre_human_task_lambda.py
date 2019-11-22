import json


def lambda_handler(event, context):
    """
    Simple pass-through pre-annotation lambda for custom SageMaker Ground Truth workflow
    source: https://docs.aws.amazon.com/sagemaker/latest/dg/sms-custom-templates-step3.html

    Parameters
    ----------
    event: dict, required
        Content of event looks something like following

        {
            "version": "2018-10-16",
            "labelingJobArn": <labelingJobArn>
            "dataObject" : {
                "source": "<text to be annotated>",
                "metadata" : <dict with meta-data>
            }
        }

        But check for latest version https://docs.aws.amazon.com/sagemaker/latest/dg/sms-custom-templates-step3.html

    context: object, required
        Lambda Context runtime methods and attributes

        Context doc: https://docs.aws.amazon.com/lambda/latest/dg/python-context-object.html

    Returns
    ------
    output: dict

        This output is an example JSON. 

        I assume that the template have only one placeholder named "taskObject".
        If your template have more than one placeholder, make sure to add one more attribute under "taskInput"

        {
           "taskInput":{
              "taskObject": <JSON object>
           },
           "humanAnnotationRequired":"true"
        }

        The dict passed to <JSON object> needs to contain ALL data your custom form requires to allow 
        the completion of your human annotation task.

        Note: Output of this lambda will be merged with the template, you specify in your labeling job.
        You can use preview button on SageMaker Ground Truth console to make sure merge is successful.

    Note
    -----
    In your custom UI .liquid.html, reference task.input.source to refer 
    to the content of the "source" field of your input mainfest file.
    """

    # Get source if specified
    source = event['dataObject']['source'] if "source" in event['dataObject'] else None
    metadata = event['dataObject']['metadata'] if "metadata" in event['dataObject'] else None

    # Build response object
    output = {
        "taskInput": {
            "source": source,
            "metadata": metadata
        },
        "humanAnnotationRequired": "true"
    }

    # print(output)

    # If source is not specified, mark the annotation failed
    if source is None:
        print("Failed to pre-process {} !".format(event["labelingJobArn"]))
        output["humanAnnotationRequired"] = "false"

    return output
