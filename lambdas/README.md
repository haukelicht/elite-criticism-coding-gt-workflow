# Custom Pre-Annotation and Annotation Consolidation Lambda Functions for Crowd-Sourced Elite-Criticism Coding

The content contained in this directory is based on [this GitHub repository](https://github.com/aws-samples/aws-sagemaker-ground-truth-recipe) maintained by AWS.
Read the [corresponding README file](https://github.com/aws-samples/aws-sagemaker-ground-truth-recipe/blob/master/README.md) for more details.

Packaging and deployment is governed by your template.yml file. 
Adapt all the `Description` and `Resources` (sub)fields in this YAML when you customize your Lambda function names.  

Run code in 'deploy.sh' to package and deploy our functions to AWS Lambda via AWS CloudFormation.

## Lambda functions

Python Lambda functions are in the subdirectory lambdas_functions/

Note that the `event` input as well as the return objects of the pre-annotation (`pre_human_task_lambda.lambda_handler`) and annotation consolidation functions (`annotation_consolidation_lambda.lambda_handler`) functions need to comply to [pre-defined formats](https://docs.aws.amazon.com/sagemaker/latest/dg/sms-custom-templates-step3.html). 

## Development and testing

There are two ways to test if your lambda functions work as expected.

### Using the `pytest` python module

Unit tests of python functions are defined in tests/ and can be run by calling `python -m pytest tests/`.

Remember to adapt the expected return values in corresponding 'tests/test_*' files when you change your `*.lambda_handler` helper functions.

### Using the SAM command line interface

Requires: [`sam` CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html) and [Docker](https://www.docker.com/community-edition)

1. Upload the files on path events/payloads/  to your AWS S3 bucket (see events/upload_payloads.sh).
2. run tests_sam_local.sh

See here for [more details](https://github.com/aws-samples/aws-sagemaker-ground-truth-recipe/blob/master/README.md#local-development).
