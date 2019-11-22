# deploy.sh

sam package \
    --output-template-file template.yaml \
    --s3-bucket my-sam-artifacts-test-v001


sam deploy \
    --template-file packaged.yaml \
    --stack-name sam-gt-custom-lambdas \
    --capabilities CAPABILITY_IAM