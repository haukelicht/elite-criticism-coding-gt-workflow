#!/bin/sh

# Test pre-annoation lamda

# expected output: '{"taskInput": {"source": "One has to weigh ...", "metadata": {...}}, "humanAnnotationRequired": "true"}'
sam local invoke GtRecipePreHumanTaskFunction \
    --event events/pre_human_task_test_event1.json \
    | jsonlint

# expected output: '{"taskInput": {"source": "Find the report ...", "metadata": {...}}, "humanAnnotationRequired": "true"}'
sam local invoke GtRecipePreHumanTaskFunction \
    --event events/pre_human_task_test_event2.json \
    | jsonlint

# expected output: '{"taskInput": {"source": null}, "humanAnnotationRequired": "false"}'
sam local invoke GtRecipePreHumanTaskFunction \
    --event events/pre_human_task_test_event3.json \
    | jsonlint

# Test pre-annoation lamda

# test case 1: value of "labelAttributeName" key  
# contained in value of "content" key in workers "annotiationData" dictionaries
# expected output:
#    [{
#        "datasetObjectId": "0",
#        "consolidatedAnnotation": {
#            "content": {
#                "crowd-classifier": {
#                    "annotationsFromAllWorkers": [{
#                        "worker_id": "public.us-east-1.#############1",
#                        "annotations": {
#                            "label": "yes"
#                        }
#                    }, {
#                        "worker_id": "public.us-east-1.#############2",
#                        "annotations": {
#                            "label": "no"
#                        }
#                    }, {
#                        "worker_id": "public.us-east-1.#############3",
#                        "annotations": {
#                            "label": "no"
#                        }
#                    }, {
#                        "worker_id": "public.us-east-1.#############4",
#                        "annotations": {
#                            "label": "no"
#                        }
#                    }, {
#                        "worker_id": "public.us-east-1.#############5",
#                        "annotations": {
#                            "label": "no"
#                        }
#                    }]
#                }
#            }
#        }
#    }]
sam local invoke GtRecipeAnnotationConsolidationFunction \
    --event events/annotation_consolidation_test_event1.json \
    | jsonlint

# test case 2: value of "labelAttributeName" key  
# not contained in value of "content" key in workers "annotiationData" dictionaries# expected output:
#    [{
#        "datasetObjectId": "0",
#        "consolidatedAnnotation": {
#            "content": {
#                "invalid-attribute": {
#                    "annotationsFromAllWorkers": [{
#                        "worker_id": "public.us-east-1.#############1",
#                        "annotations": {}
#                    }, {
#                        "worker_id": "public.us-east-1.#############2",
#                        "annotations": {}
#                    }, {
#                        "worker_id": "public.us-east-1.#############3",
#                        "annotations": {}
#                    }, {
#                        "worker_id": "public.us-east-1.#############4",
#                        "annotations": {}
#                    }, {
#                        "worker_id": "public.us-east-1.#############5",
#                        "annotations": {}
#                    }]
#                }
#            }
#        }
#    }]

sam local invoke GtRecipeAnnotationConsolidationFunction \
    --event events/annotation_consolidation_test_event2.json \
    | jsonlint

# test case 3: value of "labelAttributeName" key  
#  contained in value of "content" key in workers "annotiationData" dictionaries# expected output:
#  and long annotations JSON object
#   [
#     {
#       "datasetObjectId": "0",
#       "consolidatedAnnotation": {
#         "content": {
#           "annotations": {
#             "annotationsFromAllWorkers": [
#               {
#                 "workerId": "public.us-east-1.#############1",
#                 "annotation": {
#                   "metadata": "Some JSON formatted metadata",
#                   "task2": "no",
#                   "task1": "no",
#                   "notes": "hello"
#                 }
#               }
#             ]
#           }
#         }
#       }
#     }
#   ]

sam local invoke GtRecipeAnnotationConsolidationFunction \
    --event events/annotation_consolidation_test_event3.json \
    | jsonlint

# test case 4: value of "labelAttributeName" key  
#  contained in value of "content" key in workers "annotiationData" dictionaries# expected output:
#  and long annotations JSON object
#   [
#     {
#       "datasetObjectId": "0",
#       "consolidatedAnnotation": {
#         "content": {
#           "annotations": {
#             "annotationsFromAllWorkers": [
#               {
#                 "workerId": "public.us-east-1.#############1",
#                 "annotation": {
#                   "metadata": "Some JSON formatted metadata",
#                   "task2": "no",
#                   "task1": "no",
#                   "notes": "hello"
#                 }
#               }
#             ]
#           }
#         }
#       }
#     }
#   ]

sam local invoke GtRecipeAnnotationConsolidationFunction \
    --event events/annotation_consolidation_test_event4.json \
    | jsonlint