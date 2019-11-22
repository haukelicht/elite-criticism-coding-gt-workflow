import pytest
from aws_sagemaker_ground_truth_lambda.annotation_consolidation_lambda import parse_annotations


######## test 'parse_annotations' #########

@pytest.fixture()
def lambda_event_one_valid_annotation():
    """ Generates Lambda Event"""

    return [
        {
            'workerId': 'public.us-east-1.#############1',
            'annotationData': {
                'content': '{"attribute":{"label":"yes"}}'
            }
        }
    ]


def test_parse_annotations_with_one_valid_annotation(lambda_event_one_valid_annotation):
    res = parse_annotations(lambda_event_one_valid_annotation, '', '')
    # Expected output

    assert isinstance(lambda_event_one_valid_annotation, list)
    assert isinstance(res, dict)
    assert 'annotationsFromAllWorkers' in res

    assert len(res['annotationsFromAllWorkers']) == 1

    w_worker_id_key = ['workerId' in d for d in res['annotationsFromAllWorkers']]
    assert all(w_worker_id_key)

    w_label_key = ['annotation' in d for d in res['annotationsFromAllWorkers']]
    assert all(w_label_key)


def test_parse_annotations_with_one_valid_annotation_but_invalid_attribute_name(lambda_event_one_valid_annotation):
    res = parse_annotations(lambda_event_one_valid_annotation, 'invalid-attribute', '')

    empty_label_val = [len(d['annotation']) == 0 for d in res['annotationsFromAllWorkers']]
    assert all(empty_label_val)


def test_parse_annotations_with_one_valid_annotation_and_valid_attribute_name(lambda_event_one_valid_annotation):
    res = parse_annotations(lambda_event_one_valid_annotation, 'attribute', '')

    empty_label_val = [len(d['annotation']) == 0 for d in res['annotationsFromAllWorkers']]
    assert not any(empty_label_val)

    # valid_label_val = [d['annotation'] in ['yes', 'no'] for d in res['annotationsFromAllWorkers']]
    # assert all(valid_label_val)


@pytest.fixture()
def lambda_event_two_valid_annotations():
    """ Generates Lambda Event"""

    return [
        {
            'workerId': 'public.us-east-1.#############1',
            'annotationData': {
                'content': '{"attribute":{"label":"yes"}}'
            }
        },
        {
            'workerId': 'public.us-east-1.#############2',
            'annotationData': {
                'content': '{"attribute":{"label":"no"}}'
            }
        }
    ]


def test_parse_annotations_with_two_valid_annotations(lambda_event_two_valid_annotations):
    assert isinstance(lambda_event_two_valid_annotations, list)

    res = parse_annotations(lambda_event_two_valid_annotations, '', '')
    # Expected output

    assert isinstance(res, dict)
    assert 'annotationsFromAllWorkers' in res

    assert len(res['annotationsFromAllWorkers']) == 2

    w_worker_id_key = ['workerId' in d for d in res['annotationsFromAllWorkers']]
    assert all(w_worker_id_key)

    w_label_key = ['annotation' in d for d in res['annotationsFromAllWorkers']]
    assert all(w_label_key)


def test_parse_annotations_with_two_valid_annotations_but_invalid_attribute_name(lambda_event_two_valid_annotations):
    res = parse_annotations(lambda_event_two_valid_annotations, 'invalid-attribute', '')

    empty_label_val = [len(d['annotation']) == 0 for d in res['annotationsFromAllWorkers']]
    assert all(empty_label_val)


def test_parse_annotations_with_two_valid_annotations_and_valid_attribute_name(lambda_event_two_valid_annotations):
    res = parse_annotations(lambda_event_two_valid_annotations, 'attribute', '')

    empty_label_val = [len(d['annotation']) == 0 for d in res['annotationsFromAllWorkers']]
    assert not any(empty_label_val)

    # valid_label_val = [d['annotation'] in ['yes', 'no'] for d in res['annotationsFromAllWorkers']]
    # assert all(valid_label_val)
