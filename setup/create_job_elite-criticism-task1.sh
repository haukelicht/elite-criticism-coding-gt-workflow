# first: test
aws sagemaker create-labeling-job \
    --cli-input-json "$(< elite-criticism-task1-crowd.cli-input.json)" \
    --generate-cli-skeleton 'output'

# if valid output: 
aws sagemaker create-labeling-job \
    --cli-input-json "$(< elite-criticism-task1-crowd.cli-input.json)" \
    > elite-criticism-task1-crowd.LabelingJobArn.json
