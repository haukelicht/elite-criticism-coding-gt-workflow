import pytest
from aws_sagemaker_ground_truth_lambda.pre_human_task_lambda import lambda_handler


@pytest.fixture()
def lambda_event_with_src_ref():
  """ Generates Lambda Event"""

  return {
      "version": "2018-10-06",
      "labelingJobArn": "ARN",
      "dataObject": {
          "source-ref": "S3 path"
      }
  }


@pytest.fixture()
def lambda_event_with_src():
  """ Generates Lambda Event"""

  return {
      "version": "2018-10-06",
      "labelingJobArn": "ARN",
      "dataObject": {
          "source": "some-test-text"
      }
  }


@pytest.fixture()
def lambda_event_with_null_src_and_null_src_ref():
  """ Generates Lambda Event"""

  return {
      "version": "2018-10-06",
      "labelingJobArn": "ARN",
      "dataObject": {
      }
  }


def test_pre_human_task_lambda_handler_with_src_ref_input(lambda_event_with_src_ref):
  lambda_response = lambda_handler(lambda_event_with_src_ref, "")
  # Expected output {"taskInput": {"source": ""}, "humanAnnotationRequired": "false"}

  assert lambda_response["taskInput"]["source"] == None
  assert lambda_response["humanAnnotationRequired"] == "false"


def test_pre_human_task_lambda_handler_with_src_input(lambda_event_with_src):
  lambda_response = lambda_handler(lambda_event_with_src, "")
  # Expected output {"taskInput": {"source": "some-test-text"}, "humanAnnotationRequired": "true"}

  assert lambda_response["taskInput"]["source"] == "some-test-text"
  assert lambda_response["humanAnnotationRequired"] == "true"


def test_pre_human_task_lambda_handler_without_src_or_src_ref_input(lambda_event_with_null_src_and_null_src_ref):
  lambda_response = lambda_handler(lambda_event_with_null_src_and_null_src_ref, "")
  # Expected output {"taskInput": {"source": ""}, "humanAnnotationRequired": "false"}

  assert lambda_response["taskInput"]["source"] == None
  assert lambda_response["humanAnnotationRequired"] == "false"

