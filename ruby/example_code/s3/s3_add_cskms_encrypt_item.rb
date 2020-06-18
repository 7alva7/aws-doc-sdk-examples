# snippet-comment:[These are tags for the AWS doc team's sample catalog. Do not remove.]
# snippet-sourceauthor:[Doug-AWS]
# snippet-sourcedescription:[Adds a KMS encrypted item to an S3 bucket.]
# snippet-keyword:[Amazon Simple Storage Service]
# snippet-keyword:[put_object method]
# snippet-keyword:[Ruby]
# snippet-sourcesyntax:[ruby]
# snippet-service:[s3]
# snippet-keyword:[Code Sample]
# snippet-sourcetype:[full-example]
# snippet-sourcedate:[2018-03-16]
# Copyright 2010-2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
#
# This file is licensed under the Apache License, Version 2.0 (the "License").
# You may not use this file except in compliance with the License. A copy of the
# License is located at
#
# http://aws.amazon.com/apache2.0/
#
# This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS
# OF ANY KIND, either express or implied. See the License for the specific
# language governing permissions and limitations under the License.

require 'aws-sdk-s3'  # In v2: require 'aws-sdk'

# Get the key from the command line
if ARGV.empty?()
  puts 'You must supply a key'
  exit 1
end

key = ARGV[0]

bucket = 'my_bucket'
item = 'my_item'

# Get file content as string
contents = File.read(item)

# Create KMS client
kms = Aws::KMS::Client.new

# Create encryption client
client = Aws::S3::EncryptionV2::Client.new(
  kms_key_id: key,
  kms_client: kms
)

# Add encrypted item to bucket
client.put_object(
  body: contents,
  bucket: bucket,
  key: item
)

puts 'Added client-side KMS encrypted item ' + item + ' to bucket ' + bucket
