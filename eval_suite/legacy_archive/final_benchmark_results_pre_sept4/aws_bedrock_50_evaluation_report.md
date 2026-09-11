# TRUE HYBRID + BEDROCK Llama-3-70B Benchmark

> [!TIP]
> **Average Scores (50 Questions)**
> - **Faithfulness:** 0.80
> - **Relevance:** 0.88
> - **Context Accuracy:** 0.92

---

## Question 1
**Query:** What is the minimum set of IAM permissions required to be added to the 'Statement' section of the trusted relationship policy of the API Gateway assumable IAM role, in addition to the 'sts:AssumeRole' action, to enable the API Gateway to successfully invoke the Calc Lambda function and perform the three integrations described in the tutorial, assuming the Lambda function execution role has the necessary permissions to execute the function?

**Ground Truth:**
> The minimum set of IAM permissions required are: 'lambda:InvokeFunction' for Integration 1 and 2, and 'lambda:InvokeFunction' and 'execute-api:ExecuteApi' for Integration 3. The 'execute-api:ExecuteApi' permission is required for Integration 3 because it involves API Gateway invoking the Lambda function via a GET method with path parameters, which requires API Gateway to execute the API.

**Retrieved Context (Proof):**
`	ext
Developer Guide
Amazon API Gateway
Copyright © 2026 Amazon Web Services, Inc. and/or its aﬃliates. All rights reserved.
Amazon API Gateway
Developer Guide
Amazon API Gateway: Developer Guide
Copyright © 2026 Amazon Web Services, Inc. and/or its aﬃliates. All rights reserved.
Amazon's trademarks and trade dress may not be used in connection with any product or service 
that is not Amazon's, in any manner that is likely to cause confusion among customers, or in any 
manner that disparages or discredits Amazon. All other trademarks not owned by Amazon are 
the property of their respective owners, who may or may not be aﬃliated with, connected to, or 
sponsored by Amazon.
Amazon API Gateway
Developer Guide
Table of Contents
What is Amazon API Gateway? ....................................................................................................... 1
Architecture of API Gateway ...................................................................................................................... 2
Features of API Gateway ............................................................................................................................. 2
API Gateway use cases ................................................................................................................................ 3
Use API Gateway to create REST APIs ................................................................................................ 3
Use API Gateway to create HTTP APIs ............................................................................................... 4
Use API Gateway to create WebSocket APIs ..................................................................................... 5
Who uses API Gateway? ........................................................................................................................ 5

API Gateway use cases ................................................................................................................................ 3
Use API Gateway to create REST APIs ................................................................................................ 3
Use API Gateway to create HTTP APIs ............................................................................................... 4
Use API Gateway to create WebSocket APIs ..................................................................................... 5
Who uses API Gateway? ........................................................................................................................ 5
Accessing API Gateway ................................................................................................................................ 6
Part of AWS serverless infrastructure ...................................................................................................... 7
How to get started with Amazon API Gateway ..................................................................................... 7
API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14

API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14
API management .................................................................................................................................. 15
Development .......................................................................................................................................... 15
Monitoring .............................................................................................................................................. 16
Integrations ............................................................................................................................................ 17
Get started with the REST API console ................................................................................................. 17
Step 1: Create a Lambda function .................................................................................................... 18
Step 2: Create a REST API .................................................................................................................. 19
Step 3: Create a Lambda proxy integration .................................................................................... 19

For AWS service, select Amazon Simple Storage Service.
Keep AWS subdomain blank.
For HTTP method, select GET.
For Action type, select Use path override.
For Path override, enter {bucket}.
10. For Execution role, enter the role ARN for APIGatewayS3ProxyPolicy.
11. Choose Create method.
You set the {folder} path parameter in the Amazon S3 endpoint URL. You need to map the
{folder} path parameter of the method request to the {bucket} path parameter of the 
integration request.
To map {folder} to {bucket}
On the Integration request tab, under Integration request settings, choose Edit.
Choose URL path parameters, and then choose Add path parameter.
For Name, enter bucket.
For Mapped from, enter method.request.path.folder.
Choose Save.
Now, you test your API.
To test the /{folder} GET method.
Choose the Test tab. You might need to choose the right arrow button to show the tab.
Under Path, for folder, enter the name of your bucket.
Choose Test.
Tutorial: Create a REST API as an Amazon S3 proxy
Amazon API Gateway
Developer Guide
The test result will contain a list of object in your bucket.
Expose API methods to access an Amazon S3 object in a bucket
Amazon S3 supports GET, DELETE, HEAD, OPTIONS, POST and PUT actions to access and manage 
objects in a given bucket. In this tutorial, you expose a GET method on the {folder}/{item}
resource to get an image from a bucket. For more applications of the {folder}/{item} resource, 
see the sample API, OpenAPI deﬁnitions of the sample API as an Amazon S3 proxy.
To expose the GET method on a item resource
Select the /{item} resource, and then choose Create method.
For method type, select GET.
For Integration type, select AWS service.
Tutorial: Create a REST API as an Amazon S3 proxy
Amazon API Gateway
Developer Guide
For AWS Region, select the AWS Region where you created your Amazon S3 bucket.
For AWS service, select Amazon Simple Storage Service.
Keep AWS subdomain blank.
For HTTP method, select GET.
`

**Generated Answer (Response):**
> 

Based on the tutorial, the minimum set of IAM permissions required to be added to the 'Statement' section of the trusted relationship policy of the API Gateway assumable IAM role, in addition to the 'sts:AssumeRole' action, are:

* "execute-api:Invoke" - to invoke the Calc Lambda function
* "s3:GetObject" - to perform the GET integration with Amazon S3
* "s3:ListBucket" - to perform the GET integration with Amazon S3 (listing objects in the bucket)

So, the 'Statement' section of the trusted relationship policy would look like this:
```
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "APIGatewayAssumeRole",
      "Effect": "Allow",
      "Action": "sts:AssumeRole"
    },
    {
      "Sid": "InvokeLambda",
      "Effect": "Allow",
      "Action": "lambda:InvokeFunction",
      "Resource": "arn:aws:lambda:<region>:<account-id>:function:Calc"
    },
    {
      "Sid": "S3GetBucket",
      "Effect": "Allow",
      "Action": "s3:ListBucket",
      "Resource": "arn:aws:s3:::<bucket-name>"
    },
    {
      "Sid": "S3GetObject",
      "Effect": "Allow",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::<bucket-name>/*"
    }
  ]
}
```
Note: Replace `<region>`, `<account-id>`, `<bucket-name>` with the actual values for your AWS account and resources.

**Scores:** Faithfulness: 0 | Relevance: 1 | Context Accuracy: 1

---

## Question 2
**Query:** What is the primary difference between an HTTP custom integration and an HTTP proxy integration in Amazon API Gateway, and how would you configure the API Gateway console to achieve the desired API behavior using a non-proxy HTTP integration, as demonstrated in the tutorial for creating a REST API with an HTTP non-proxy integration?

**Ground Truth:**
> The primary difference between an HTTP custom integration and an HTTP proxy integration in Amazon API Gateway is that a custom integration allows for more fine-grained control over the integration, whereas a proxy integration passes the entire request to the backend. To configure the API Gateway console for a non-proxy HTTP integration, you would keep the 'Proxy resource' option turned off when creating a new resource, and then configure the method to achieve the desired API behavior, such as exposing a GET method on the /pets resource to retrieve a list of available Pets items from the PetStore website.

**Retrieved Context (Proof):**
`	ext
Developer Guide
Amazon API Gateway
Copyright © 2026 Amazon Web Services, Inc. and/or its aﬃliates. All rights reserved.
Amazon API Gateway
Developer Guide
Amazon API Gateway: Developer Guide
Copyright © 2026 Amazon Web Services, Inc. and/or its aﬃliates. All rights reserved.
Amazon's trademarks and trade dress may not be used in connection with any product or service 
that is not Amazon's, in any manner that is likely to cause confusion among customers, or in any 
manner that disparages or discredits Amazon. All other trademarks not owned by Amazon are 
the property of their respective owners, who may or may not be aﬃliated with, connected to, or 
sponsored by Amazon.
Amazon API Gateway
Developer Guide
Table of Contents
What is Amazon API Gateway? ....................................................................................................... 1
Architecture of API Gateway ...................................................................................................................... 2
Features of API Gateway ............................................................................................................................. 2
API Gateway use cases ................................................................................................................................ 3
Use API Gateway to create REST APIs ................................................................................................ 3
Use API Gateway to create HTTP APIs ............................................................................................... 4
Use API Gateway to create WebSocket APIs ..................................................................................... 5
Who uses API Gateway? ........................................................................................................................ 5

API Gateway use cases ................................................................................................................................ 3
Use API Gateway to create REST APIs ................................................................................................ 3
Use API Gateway to create HTTP APIs ............................................................................................... 4
Use API Gateway to create WebSocket APIs ..................................................................................... 5
Who uses API Gateway? ........................................................................................................................ 5
Accessing API Gateway ................................................................................................................................ 6
Part of AWS serverless infrastructure ...................................................................................................... 7
How to get started with Amazon API Gateway ..................................................................................... 7
API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14

API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14
API management .................................................................................................................................. 15
Development .......................................................................................................................................... 15
Monitoring .............................................................................................................................................. 16
Integrations ............................................................................................................................................ 17
Get started with the REST API console ................................................................................................. 17
Step 1: Create a Lambda function .................................................................................................... 18
Step 2: Create a REST API .................................................................................................................. 19
Step 3: Create a Lambda proxy integration .................................................................................... 19

A model is convenient for generating a sample mapping template to initiate creation of a 
production mapping template. Although useful, a model is not required for creating a mapping 
template.
Portal
See Developer portal.
Portal Product
A service or functionality that you want to share. Your portal product is a collection of product 
REST endpoints and product pages. Product REST endpoints are the access points to your portal 
product, and they consist of the path and method of a REST API and the stage it's deployed to. 
Product pages are documentation that you provide to explain how API consumers can use your 
product endpoints. You can share products across AWS accounts to add them to portals.
See Create a product.
Private API
See Private API endpoint.
Private API endpoint
An API endpoint that is exposed through interface VPC endpoints and allows a client to securely 
access private API resources inside a VPC. Private APIs are isolated from the public internet, and 
they can only be accessed using VPC endpoints for API Gateway that have been granted access.
Private integration
An API Gateway integration type for a client to access resources inside a customer's VPC 
through a private REST API endpoint without exposing the resources to the public internet.
Proxy integration
A simpliﬁed API Gateway integration conﬁguration. You can set up a proxy integration as an 
HTTP proxy integration or a Lambda proxy integration.
For HTTP proxy integration, API Gateway passes the entire request and response between the 
frontend and an HTTP backend. For Lambda proxy integration, API Gateway sends the entire 
API Gateway concepts
Amazon API Gateway
Developer Guide
request as input to a backend Lambda function. API Gateway then transforms the Lambda 
function output to a frontend HTTP response.
In REST APIs, proxy integration is most commonly used with a proxy resource, which is 
represented by a greedy path variable (for example, {proxy+}) combined with a catch-all ANY
method.

Tutorials and workshops ............................................................................................................... 30
REST API tutorials ...................................................................................................................................... 31
Choose a Lambda integration tutorial ............................................................................................. 31
Tutorial: Create a REST API by importing an example .................................................................. 55
Choose an HTTP integration tutorial ............................................................................................... 65
Tutorial: Create a REST API with a private integration ................................................................. 79
Tutorial: Create a REST API with an AWS integration ................................................................... 85
Tutorial: Create a calculator REST API with three integrations ................................................... 91
Tutorial: Create a REST API as an Amazon S3 proxy .................................................................. 117
Tutorial: Create a REST API as an Amazon Kinesis proxy ........................................................... 162
Tutorial: Create a REST API using AWS SDKs or the AWS CLI ................................................... 207
Tutorial: Create a private REST API ................................................................................................ 241
HTTP API tutorials ................................................................................................................................... 247
Tutorial: Build a CRUD HTTP API with Lambda and DynamoDB .............................................. 247
Tutorial: Create an HTTP API with a private integration to Amazon ECS ................................ 260
`

**Generated Answer (Response):**
> 

According to the provided context, the primary difference between an HTTP custom integration and an HTTP proxy integration in Amazon API Gateway is how the request and response are handled.

In an HTTP proxy integration, API Gateway passes the entire request and response between the frontend and an HTTP backend. This means that API Gateway acts as a simple pass-through, without modifying the request or response.

On the other hand, in an HTTP custom integration (also referred to as a non-proxy integration), API Gateway allows for more control over the request and response, enabling you to modify or transform the data as needed.

To configure the API Gateway console to achieve the desired API behavior using a non-proxy HTTP integration, you would follow these general steps:

1. Create a new API or choose an existing one in the API Gateway console.
2. Define a new resource and method (e.g., GET, POST, etc.) for the API.
3. In the Integration Request section, select "HTTP" as the integration type.
4. Choose "Non-proxy" as the integration subtype.
5. Configure the request mapping, including any necessary transformations or modifications to the request data.
6. Define the backend HTTP endpoint URL and any required headers, query parameters, or authentication settings.
7. In the Integration Response section, configure the response mapping, including any necessary transformations or modifications to the response data.
8. Test and deploy the API to verify the desired behavior.

The tutorial for creating a REST API with an HTTP non-proxy integration (not provided in the context, but presumably available in the API Gateway documentation) would provide more detailed, step-by-step instructions for configuring a non-proxy HTTP integration in API Gateway.

**Scores:** Faithfulness: 1 | Relevance: 1 | Context Accuracy: 1

---

## Question 3
**Query:** What is the primary purpose of the Log entry in the API Gateway test output, and how does it facilitate troubleshooting of mapping errors that cause the request to fail?

**Ground Truth:**
> The primary purpose of the Log entry is to display the state changes from the method request to the integration request, and from the integration response to the method response, which facilitates troubleshooting of mapping errors by allowing developers to identify where the request is failing in the API Gateway pipeline.

**Retrieved Context (Proof):**
`	ext
Developer Guide
Amazon API Gateway
Copyright © 2026 Amazon Web Services, Inc. and/or its aﬃliates. All rights reserved.
Amazon API Gateway
Developer Guide
Amazon API Gateway: Developer Guide
Copyright © 2026 Amazon Web Services, Inc. and/or its aﬃliates. All rights reserved.
Amazon's trademarks and trade dress may not be used in connection with any product or service 
that is not Amazon's, in any manner that is likely to cause confusion among customers, or in any 
manner that disparages or discredits Amazon. All other trademarks not owned by Amazon are 
the property of their respective owners, who may or may not be aﬃliated with, connected to, or 
sponsored by Amazon.
Amazon API Gateway
Developer Guide
Table of Contents
What is Amazon API Gateway? ....................................................................................................... 1
Architecture of API Gateway ...................................................................................................................... 2
Features of API Gateway ............................................................................................................................. 2
API Gateway use cases ................................................................................................................................ 3
Use API Gateway to create REST APIs ................................................................................................ 3
Use API Gateway to create HTTP APIs ............................................................................................... 4
Use API Gateway to create WebSocket APIs ..................................................................................... 5
Who uses API Gateway? ........................................................................................................................ 5

API Gateway use cases ................................................................................................................................ 3
Use API Gateway to create REST APIs ................................................................................................ 3
Use API Gateway to create HTTP APIs ............................................................................................... 4
Use API Gateway to create WebSocket APIs ..................................................................................... 5
Who uses API Gateway? ........................................................................................................................ 5
Accessing API Gateway ................................................................................................................................ 6
Part of AWS serverless infrastructure ...................................................................................................... 7
How to get started with Amazon API Gateway ..................................................................................... 7
API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14

API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14
API management .................................................................................................................................. 15
Development .......................................................................................................................................... 15
Monitoring .............................................................................................................................................. 16
Integrations ............................................................................................................................................ 17
Get started with the REST API console ................................................................................................. 17
Step 1: Create a Lambda function .................................................................................................... 18
Step 2: Create a REST API .................................................................................................................. 19
Step 3: Create a Lambda proxy integration .................................................................................... 19

\n}" 
          }, 
          "type": "aws" 
        } 
Tutorial: Create a calculator REST API with three integrations
Amazon API Gateway
Developer Guide
      }, 
      "post": { 
        "consumes": [ 
          "application/json" 
        ], 
        "produces": [ 
          "application/json" 
        ], 
        "parameters": [ 
          { 
            "in": "body", 
            "name": "Input", 
            "required": true, 
            "schema": { 
              "$ref": "#/definitions/Input" 
            } 
          } 
        ], 
        "responses": { 
          "200": { 
            "description": "200 response", 
            "schema": { 
              "$ref": "#/definitions/Result" 
            } 
          } 
        }, 
        "x-amazon-apigateway-request-validator": "Validate body", 
        "x-amazon-apigateway-integration": { 
          "credentials": "arn:aws:iam::123456789012:role/apigAwsProxyRole", 
          "responses": { 
            "default": { 
              "statusCode": "200", 
              "responseTemplates": { 
                "application/json": "#set($inputRoot = $input.path('$'))\n{\n  \"a
\" : $inputRoot.a,\n  \"b\" : $inputRoot.b,\n  \"op\" : $inputRoot.op,\n  \"c\" : 
 $inputRoot.c\n}" 
              } 
            } 
          }, 
          "uri": "arn:aws:apigateway:us-west-2:lambda:path/2015-03-31/functions/
arn:aws:lambda:us-west-2:123456789012:function:Calc/invocations", 
          "passthroughBehavior": "when_no_templates", 
          "httpMethod": "POST", 
          "type": "aws" 
Tutorial: Create a calculator REST API with three integrations
Amazon API Gateway
Developer Guide
        } 
      } 
    }, 
    "/calc/{operand1}/{operand2}/{operator}": { 
      "get": { 
        "consumes": [ 
          "application/json" 
        ], 
        "produces": [ 
          "application/json" 
        ], 
        "parameters": [ 
          { 
            "name": "operand2", 
            "in": "path",

client at run time. The ANY method allows you to use a single API method setup for all of the 
supported HTTP methods: DELETE, GET, HEAD, OPTIONS, PATCH, POST, and PUT.
To create an ANY method
Select the /helloworld resource, and then choose Create method.
For Method type, select ANY.
For Integration type, select Lambda function.
Turn on Lambda proxy integration.
For Lambda function, select the AWS Region where you created your Lambda function, and 
then enter the function name.
To use the default timeout value of 29 seconds, keep Default timeout turned on. To set a 
custom timeout, choose Default timeout and enter a timeout value between 50 and 29000
milliseconds.
Choose Create method.
Choose a Lambda integration tutorial
Amazon API Gateway
Developer Guide
Deploy and test the API
To deploy your API
Choose Deploy API.
For Stage, select New stage.
For Stage name, enter test.
(Optional) For Description, enter a description.
Choose Deploy.
Under Stage details, choose the copy icon to copy your API's invoke URL.
Use browser and cURL to test an API with Lambda proxy integration
You can use a browser or cURL to test your API.
To test GET requests using only query string parameters, you can enter the URL for the API's
helloworld resource into a browser address bar.
To create the URL for the API's helloworld resource, append the resource helloworld and 
the query string parameter ?greeter=John to your invoke URL. Your URL should look like the 
following.
For other methods, you must use more advanced REST API testing utilities, such as POSTMAN or
cURL. This tutorial uses cURL. The cURL command examples below assume that cURL is installed 
on your computer.
To test your deployed API using cURL:
Open a terminal window.
Copy the following cURL command and paste it into the terminal window, and replace the 
invoke URL with the one you copied in the previous step and add /helloworld to the end of 
the URL.
Note
If you're running the command on Windows, use this syntax instead:
`

**Generated Answer (Response):**
> 

There is no mention of a "Log entry" in the provided context. The context appears to be a tutorial on creating a REST API with API Gateway and integrating it with a Lambda function. It covers topics such as creating a REST API, choosing between REST APIs and HTTP APIs, security, authorization, and testing the API using a browser and cURL. However, it does not mention log entries or troubleshooting mapping errors.

**Scores:** Faithfulness: 1 | Relevance: 0 | Context Accuracy: 1

---

## Question 4
**Query:** What is the only authorization option that can be used with both REST APIs and HTTP APIs, and also supports custom domains, API keys, per-client rate limiting, and per-client usage throttling, while allowing for request validation, request parameter transformation, and request body transformation, and can be integrated with Amazon CloudWatch metrics, access logs to CloudWatch Logs, and AWS X-Ray tracing?

**Ground Truth:**
> IAM

**Retrieved Context (Proof):**
`	ext
Developer Guide
Amazon API Gateway
Copyright © 2026 Amazon Web Services, Inc. and/or its aﬃliates. All rights reserved.
Amazon API Gateway
Developer Guide
Amazon API Gateway: Developer Guide
Copyright © 2026 Amazon Web Services, Inc. and/or its aﬃliates. All rights reserved.
Amazon's trademarks and trade dress may not be used in connection with any product or service 
that is not Amazon's, in any manner that is likely to cause confusion among customers, or in any 
manner that disparages or discredits Amazon. All other trademarks not owned by Amazon are 
the property of their respective owners, who may or may not be aﬃliated with, connected to, or 
sponsored by Amazon.
Amazon API Gateway
Developer Guide
Table of Contents
What is Amazon API Gateway? ....................................................................................................... 1
Architecture of API Gateway ...................................................................................................................... 2
Features of API Gateway ............................................................................................................................. 2
API Gateway use cases ................................................................................................................................ 3
Use API Gateway to create REST APIs ................................................................................................ 3
Use API Gateway to create HTTP APIs ............................................................................................... 4
Use API Gateway to create WebSocket APIs ..................................................................................... 5
Who uses API Gateway? ........................................................................................................................ 5

API Gateway use cases ................................................................................................................................ 3
Use API Gateway to create REST APIs ................................................................................................ 3
Use API Gateway to create HTTP APIs ............................................................................................... 4
Use API Gateway to create WebSocket APIs ..................................................................................... 5
Who uses API Gateway? ........................................................................................................................ 5
Accessing API Gateway ................................................................................................................................ 6
Part of AWS serverless infrastructure ...................................................................................................... 7
How to get started with Amazon API Gateway ..................................................................................... 7
API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14

API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14
API management .................................................................................................................................. 15
Development .......................................................................................................................................... 15
Monitoring .............................................................................................................................................. 16
Integrations ............................................................................................................................................ 17
Get started with the REST API console ................................................................................................. 17
Step 1: Create a Lambda function .................................................................................................... 18
Step 2: Create a REST API .................................................................................................................. 19
Step 3: Create a Lambda proxy integration .................................................................................... 19

For more information about API Gateway WebSocket APIs, see the section called “Use API Gateway 
to create WebSocket APIs” and the section called “Overview of WebSocket APIs”.
Topics
• Architecture of API Gateway
• Features of API Gateway
• API Gateway use cases
• Accessing API Gateway
• Part of AWS serverless infrastructure
• How to get started with Amazon API Gateway
Amazon API Gateway
Developer Guide
• Amazon API Gateway concepts
• Choose between REST APIs and HTTP APIs
• Get started with the REST API console
Architecture of API Gateway
The following diagram shows API Gateway architecture.
This diagram illustrates how the APIs you build in Amazon API Gateway provide you or your 
developer customers with an integrated and consistent developer experience for building AWS 
serverless applications. API Gateway handles all the tasks involved in accepting and processing 
up to hundreds of thousands of concurrent API calls. These tasks include traﬃc management, 
authorization and access control, monitoring, and API version management.
API Gateway acts as a "front door" for applications to access data, business logic, or functionality 
from your backend services, such as workloads running on Amazon Elastic Compute Cloud 
(Amazon EC2), code running on AWS Lambda, any web application, or real-time communication 
applications.
Features of API Gateway
Amazon API Gateway oﬀers features such as the following:
Architecture of API Gateway
Amazon API Gateway
Developer Guide
• Support for stateful (WebSocket) and stateless (HTTP and REST) APIs.
• Powerful, ﬂexible authentication mechanisms, such as AWS Identity and Access Management 
policies, Lambda authorizer functions, and Amazon Cognito user pools.
• Canary release deployments for safely rolling out changes.
• CloudTrail logging and monitoring of API usage and API changes.
• CloudWatch access logging and execution logging, including the ability to set alarms. For more

To learn more, see the section called “Choose between REST APIs and HTTP APIs ”.
Use API Gateway to create WebSocket APIs
In a WebSocket API, the client and the server can both send messages to each other at any 
time. Backend servers can easily push data to connected users and devices, avoiding the need to 
implement complex polling mechanisms.
For example, you could build a serverless application using an API Gateway WebSocket API and 
AWS Lambda to send and receive messages to and from individual users or groups of users in a 
chat room. Or you could invoke backend services such as AWS Lambda, Amazon Kinesis, or an HTTP 
endpoint based on message content.
You can use API Gateway WebSocket APIs to build secure, real-time communication applications 
without having to provision or manage any servers to manage connections or large-scale data 
exchanges. Targeted use cases include real-time applications such as the following:
• Chat applications
• Real-time dashboards such as stock tickers
• Real-time alerts and notiﬁcations
API Gateway provides WebSocket API management functionality such as the following:
• Monitoring and throttling of connections and messages
• Using AWS X-Ray to trace messages as they travel through the APIs to backend services
• Easy integration with HTTP/HTTPS endpoints
Who uses API Gateway?
There are two kinds of developers who use API Gateway: API developers and app developers.
An API developer creates and deploys an API to enable the required functionality in API Gateway. 
The API developer must be a user in the AWS account that owns the API.
An app developer builds a functioning application to call AWS services by invoking a WebSocket or 
REST API created by an API developer in API Gateway.
Use API Gateway to create WebSocket APIs
Amazon API Gateway
Developer Guide
The app developer is the customer of the API developer. The app developer doesn't need to
`

**Generated Answer (Response):**
> 

Based on the provided context, the answer is not explicitly mentioned. However, it can be inferred that the authorization option being referred to is likely AWS Identity and Access Management (IAM) policies, which are mentioned as one of the powerful, flexible authentication mechanisms supported by API Gateway.

IAM policies can be used with both REST APIs and HTTP APIs, and they support custom domains, API keys, per-client rate limiting, and per-client usage throttling. Additionally, IAM policies can be used for request validation, request parameter transformation, and request body transformation. They can also be integrated with Amazon CloudWatch metrics, access logs to CloudWatch Logs, and AWS X-Ray tracing.

However, without further information or context, it's impossible to provide a definitive answer.

**Scores:** Faithfulness: 1 | Relevance: 1 | Context Accuracy: 1

---

## Question 5
**Query:** What is the specific Condition clause that will be present in the Allow policy of the Lambda function after executing the aws lambda add-permission command string, and how does it relate to the API's GET method?

**Ground Truth:**
> The Condition clause will be 'AWS:SourceArn': 'arn:aws:execute-api:<region>:<account-id>:<api-id>/<stage-name>/GET/helloworld', which specifies that the Lambda function can only be invoked by the API's GET method with the specified ARN.

**Retrieved Context (Proof):**
`	ext
Developer Guide
Amazon API Gateway
Copyright © 2026 Amazon Web Services, Inc. and/or its aﬃliates. All rights reserved.
Amazon API Gateway
Developer Guide
Amazon API Gateway: Developer Guide
Copyright © 2026 Amazon Web Services, Inc. and/or its aﬃliates. All rights reserved.
Amazon's trademarks and trade dress may not be used in connection with any product or service 
that is not Amazon's, in any manner that is likely to cause confusion among customers, or in any 
manner that disparages or discredits Amazon. All other trademarks not owned by Amazon are 
the property of their respective owners, who may or may not be aﬃliated with, connected to, or 
sponsored by Amazon.
Amazon API Gateway
Developer Guide
Table of Contents
What is Amazon API Gateway? ....................................................................................................... 1
Architecture of API Gateway ...................................................................................................................... 2
Features of API Gateway ............................................................................................................................. 2
API Gateway use cases ................................................................................................................................ 3
Use API Gateway to create REST APIs ................................................................................................ 3
Use API Gateway to create HTTP APIs ............................................................................................... 4
Use API Gateway to create WebSocket APIs ..................................................................................... 5
Who uses API Gateway? ........................................................................................................................ 5

API Gateway use cases ................................................................................................................................ 3
Use API Gateway to create REST APIs ................................................................................................ 3
Use API Gateway to create HTTP APIs ............................................................................................... 4
Use API Gateway to create WebSocket APIs ..................................................................................... 5
Who uses API Gateway? ........................................................................................................................ 5
Accessing API Gateway ................................................................................................................................ 6
Part of AWS serverless infrastructure ...................................................................................................... 7
How to get started with Amazon API Gateway ..................................................................................... 7
API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14

API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14
API management .................................................................................................................................. 15
Development .......................................................................................................................................... 15
Monitoring .............................................................................................................................................. 16
Integrations ............................................................................................................................................ 17
Get started with the REST API console ................................................................................................. 17
Step 1: Create a Lambda function .................................................................................................... 18
Step 2: Create a REST API .................................................................................................................. 19
Step 3: Create a Lambda proxy integration .................................................................................... 19

as %2F instead of /. This template translates the %2F into '/' before passing it to the Lambda 
function.
To create a mapping template
On the Integration request tab, under Integration request settings, choose Edit.
For Request body passthrough, select When there are no templates deﬁned 
(recommended).
Choose Mapping templates.
For Content type, enter application/json.
For Template body, enter the following code:
{ 
   "a": "$input.params('operand1')", 
   "b": "$input.params('operand2')", 
   "op": 
 #if($input.params('operator')=='%2F')"/"#{else}"$input.params('operator')"#end
}
Choose Save.
Tutorial: Create a calculator REST API with three integrations
Amazon API Gateway
Developer Guide
You can now test your GET method to verify that it has been properly set up to invoke the Lambda 
function and pass the original output through the integration response without mapping.
To test the GET method
Choose the Test tab. You might need to choose the right arrow button to show the tab.
For the Path, do the following:
a.
For operand1, enter 1.
b.
For operand2, enter 1.
c.
For operator, enter +.
Choose Test.
The result should look like this:
Next, you model the data structure of the method response payload after the result schema.
By default, the method response body is assigned an empty model. This will cause the integration 
response body to be passed through without mapping. However, when you generate an SDK for 
one of the strongly-type languages, such as Java or Objective-C, your SDK users will receive an 
empty object as the result. To ensure that both the REST client and SDK clients receive the desired 
result, you must model the response data using a predeﬁned schema. Here you'll deﬁne a model 
for the method response body and to construct a mapping template to translate the integration 
response body into the method response body.
To create a method response
On the Method response tab, under Response 200, choose Edit.
Under Response body, choose Add model.

operator.
15. Choose Create method.
Now, you create a mapping template to translate the client-supplied query strings to the 
integration request payload as required by the Calc function. This template maps the three query 
string parameters declared in Method request into designated property values of the JSON object 
as the input to the backend Lambda function. The transformed JSON object will be included as the 
integration request payload.
To map input parameters to the integration request
On the Integration request tab, under Integration request settings, choose Edit.
For Request body passthrough, select When there are no templates deﬁned 
(recommended).
Choose Mapping templates.
Choose Add mapping template.
For Content type, enter application/json.
For Template body, enter the following code:
{ 
    "a":  "$input.params('operand1')", 
    "b":  "$input.params('operand2')",  
    "op": "$input.params('operator')"    
}
Choose Save.
You can now test your GET method to verify that it has been properly set up to invoke the Lambda 
function.
Tutorial: Create a calculator REST API with three integrations
Amazon API Gateway
Developer Guide
To test the GET method
Choose the Test tab. You might need to choose the right arrow button to show the tab.
For Query strings, enter operand1=2&operand2=3&operator=+.
Choose Test.
The results should look similar to this:
Integration 2: Create a POST method with a JSON payload to call the Lambda 
function
By creating a POST method with a JSON payload to call the Lambda function, you make it so that 
the client must provide the necessary input to the backend function in the request body. To ensure 
that the client uploads the correct input data, you'll enable request validation on the payload.
To create a POST method with a JSON payload
Select the /calc resource, and then choose Create method.
For Method type, select POST.
For Integration type, select AWS service.
`

**Generated Answer (Response):**
> 

The specific Condition clause that will be present in the Allow policy of the Lambda function after executing the `aws lambda add-permission` command string is:

`"Condition": {"ArnLike": {"AWS:SourceArn": "arn:aws:execute-api:*:*:*/*/GET/calc"}}`

This Condition clause relates to the API's GET method because it specifies that the Lambda function can only be invoked by the API Gateway when the `GET /calc` method is called. The `ArnLike` condition matches the ARN of the API Gateway REST API and the specific `GET /calc` method.

**Scores:** Faithfulness: 1 | Relevance: 1 | Context Accuracy: 1

---

## Question 6
**Query:** What is the minimum number of tutorials that an AWS developer would need to complete to gain comprehensive knowledge of creating REST APIs with private integrations, AWS integrations, and HTTP APIs using AWS SDKs or the AWS CLI, assuming they want to cover at least one tutorial from each of these categories and also learn how to create a REST API as an Amazon S3 proxy?

**Ground Truth:**
> 4 tutorials: Tutorial: Create a REST API with a private integration (79), Tutorial: Create a REST API with an AWS integration (85), Tutorial: Create a REST API using AWS SDKs or the AWS CLI (207), and Tutorial: Create a REST API as an Amazon S3 proxy (117)

**Retrieved Context (Proof):**
`	ext
Developer Guide
Amazon API Gateway
Copyright © 2026 Amazon Web Services, Inc. and/or its aﬃliates. All rights reserved.
Amazon API Gateway
Developer Guide
Amazon API Gateway: Developer Guide
Copyright © 2026 Amazon Web Services, Inc. and/or its aﬃliates. All rights reserved.
Amazon's trademarks and trade dress may not be used in connection with any product or service 
that is not Amazon's, in any manner that is likely to cause confusion among customers, or in any 
manner that disparages or discredits Amazon. All other trademarks not owned by Amazon are 
the property of their respective owners, who may or may not be aﬃliated with, connected to, or 
sponsored by Amazon.
Amazon API Gateway
Developer Guide
Table of Contents
What is Amazon API Gateway? ....................................................................................................... 1
Architecture of API Gateway ...................................................................................................................... 2
Features of API Gateway ............................................................................................................................. 2
API Gateway use cases ................................................................................................................................ 3
Use API Gateway to create REST APIs ................................................................................................ 3
Use API Gateway to create HTTP APIs ............................................................................................... 4
Use API Gateway to create WebSocket APIs ..................................................................................... 5
Who uses API Gateway? ........................................................................................................................ 5

API Gateway use cases ................................................................................................................................ 3
Use API Gateway to create REST APIs ................................................................................................ 3
Use API Gateway to create HTTP APIs ............................................................................................... 4
Use API Gateway to create WebSocket APIs ..................................................................................... 5
Who uses API Gateway? ........................................................................................................................ 5
Accessing API Gateway ................................................................................................................................ 6
Part of AWS serverless infrastructure ...................................................................................................... 7
How to get started with Amazon API Gateway ..................................................................................... 7
API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14

API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14
API management .................................................................................................................................. 15
Development .......................................................................................................................................... 15
Monitoring .............................................................................................................................................. 16
Integrations ............................................................................................................................................ 17
Get started with the REST API console ................................................................................................. 17
Step 1: Create a Lambda function .................................................................................................... 18
Step 2: Create a REST API .................................................................................................................. 19
Step 3: Create a Lambda proxy integration .................................................................................... 19

OpenAPI in API Gateway.
Note
To integrate your API Gateway API with Amazon S3, you must choose a region where both 
the API Gateway and Amazon S3 services are available. For region availability, see Amazon 
API Gateway Endpoints and Quotas.
Topics
• Set up IAM permissions for the API to invoke Amazon S3 actions
• Create API resources to represent Amazon S3 resources
• Expose an API method to list the caller's Amazon S3 buckets
• Expose API methods to access an Amazon S3 bucket
• Expose API methods to access an Amazon S3 object in a bucket
• OpenAPI deﬁnitions of the sample API as an Amazon S3 proxy
• Call the API using a REST API client
Set up IAM permissions for the API to invoke Amazon S3 actions
To allow the API to invoke Amazon S3 actions, you must have the appropriate IAM policies 
attached to an IAM role. In this step, you create a new IAM role.
To create the AWS service proxy execution role
Sign in to the AWS Management Console and open the IAM console at https:// 
console.aws.amazon.com/iam/.
Choose Roles.
Tutorial: Create a REST API as an Amazon S3 proxy
Amazon API Gateway
Developer Guide
Choose Create role.
Choose AWS service under Select type of trusted entity, and then select API Gateway and 
select Allows API Gateway to push logs to CloudWatch Logs.
Choose Next, and then choose Next.
For Role name, enter APIGatewayS3ProxyPolicy, and then choose Create role.
In the Roles list, choose the role you just created. You may need to scroll or use the search bar 
to ﬁnd the role.
For the selected role, select the Add permissions tab.
Choose Attach policies from the dropdown list.
10. In the search bar, enter AmazonS3FullAccess and choose Add permissions.
Note
This tutorial uses a managed policy for simplicity. As a best practice, you should create 
your own IAM policy to grant the minimum permissions required.
11. Note the newly created Role ARN, you will use it later.
Create API resources to represent Amazon S3 resources

10. Repeat the following steps to create an integration response for the 500 method response. For
HTTP status regex, enter 5\d{2}.
Tutorial: Create a REST API as an Amazon S3 proxy
Amazon API Gateway
Developer Guide
As a good practice, you can test the API you have conﬁgured so far.
To test the GET / method
Choose the Test tab. You might need to choose the right arrow button to show the tab.
Choose Test. The result should look like the following image:
Expose API methods to access an Amazon S3 bucket
To work with an Amazon S3 bucket, you expose the GET method on the /{folder} resource to list 
objects in a bucket. The instructions are similar to those described in Expose an API method to list 
the caller's Amazon S3 buckets. For more methods, you can import the sample API here, OpenAPI 
deﬁnitions of the sample API as an Amazon S3 proxy.
Tutorial: Create a REST API as an Amazon S3 proxy
Amazon API Gateway
Developer Guide
To expose the GET method on a folder resource
Select the /{folder} resource, and then choose Create method.
For method type, select GET.
For Integration type, select AWS service.
For AWS Region, select the AWS Region where you created your Amazon S3 bucket.
For AWS service, select Amazon Simple Storage Service.
Keep AWS subdomain blank.
For HTTP method, select GET.
For Action type, select Use path override.
For Path override, enter {bucket}.
10. For Execution role, enter the role ARN for APIGatewayS3ProxyPolicy.
11. Choose Create method.
You set the {folder} path parameter in the Amazon S3 endpoint URL. You need to map the
{folder} path parameter of the method request to the {bucket} path parameter of the 
integration request.
To map {folder} to {bucket}
On the Integration request tab, under Integration request settings, choose Edit.
Choose URL path parameters, and then choose Add path parameter.
For Name, enter bucket.
For Mapped from, enter method.request.path.folder.
Choose Save.
Now, you test your API.
To test the /{folder} GET method.
`

**Generated Answer (Response):**
> 

Based on the provided context, I can see that there are tutorials for creating a REST API as an Amazon S3 proxy, but there are no explicit tutorials for creating REST APIs with private integrations, AWS integrations, and HTTP APIs using AWS SDKs or the AWS CLI.

However, I can infer that the tutorial "Create a REST API as an Amazon S3 proxy" covers AWS integrations, and the steps provided in this tutorial can be used as a starting point for creating REST APIs with AWS integrations.

To gain comprehensive knowledge of creating REST APIs with private integrations, AWS integrations, and HTTP APIs using AWS SDKs or the AWS CLI, I would recommend the following minimum number of tutorials:

1. "Create a REST API as an Amazon S3 proxy" (covers AWS integrations)
2. One tutorial on creating REST APIs with private integrations (not explicitly mentioned in the provided context, but assumed to be available)
3. One tutorial on creating HTTP APIs using AWS SDKs or the AWS CLI (not explicitly mentioned in the provided context, but assumed to be available)

Therefore, the minimum number of tutorials required is 3.

**Scores:** Faithfulness: 1 | Relevance: 1 | Context Accuracy: 1

---

## Question 7
**Query:** What is the primary difference in the usage of x-amazon-apigateway-authorizer and x-amazon-apigateway-authtype in API Gateway, and how would you implement them in a scenario where you need to authenticate and authorize access to a REST API using a custom authorizer function, while also specifying the authentication type as AWS_IAM?

**Ground Truth:**
> The primary difference between x-amazon-apigateway-authorizer and x-amazon-apigateway-authtype is that x-amazon-apigateway-authorizer is used to specify a custom authorizer function to authenticate and authorize access to an API, whereas x-amazon-apigateway-authtype is used to specify the authentication type, such as AWS_IAM, CUSTOM, or NONE. To implement them in the given scenario, you would first specify the x-amazon-apigateway-authtype as AWS_IAM, and then define an x-amazon-apigateway-authorizer with a custom authorizer function that verifies the IAM credentials and returns an authorization response. The custom authorizer function would need to be deployed as an AWS Lambda function and configured as an authorizer in the API Gateway.

**Retrieved Context (Proof):**
`	ext
Developer Guide
Amazon API Gateway
Copyright © 2026 Amazon Web Services, Inc. and/or its aﬃliates. All rights reserved.
Amazon API Gateway
Developer Guide
Amazon API Gateway: Developer Guide
Copyright © 2026 Amazon Web Services, Inc. and/or its aﬃliates. All rights reserved.
Amazon's trademarks and trade dress may not be used in connection with any product or service 
that is not Amazon's, in any manner that is likely to cause confusion among customers, or in any 
manner that disparages or discredits Amazon. All other trademarks not owned by Amazon are 
the property of their respective owners, who may or may not be aﬃliated with, connected to, or 
sponsored by Amazon.
Amazon API Gateway
Developer Guide
Table of Contents
What is Amazon API Gateway? ....................................................................................................... 1
Architecture of API Gateway ...................................................................................................................... 2
Features of API Gateway ............................................................................................................................. 2
API Gateway use cases ................................................................................................................................ 3
Use API Gateway to create REST APIs ................................................................................................ 3
Use API Gateway to create HTTP APIs ............................................................................................... 4
Use API Gateway to create WebSocket APIs ..................................................................................... 5
Who uses API Gateway? ........................................................................................................................ 5

API Gateway use cases ................................................................................................................................ 3
Use API Gateway to create REST APIs ................................................................................................ 3
Use API Gateway to create HTTP APIs ............................................................................................... 4
Use API Gateway to create WebSocket APIs ..................................................................................... 5
Who uses API Gateway? ........................................................................................................................ 5
Accessing API Gateway ................................................................................................................................ 6
Part of AWS serverless infrastructure ...................................................................................................... 7
How to get started with Amazon API Gateway ..................................................................................... 7
API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14

API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14
API management .................................................................................................................................. 15
Development .......................................................................................................................................... 15
Monitoring .............................................................................................................................................. 16
Integrations ............................................................................................................................................ 17
Get started with the REST API console ................................................................................................. 17
Step 1: Create a Lambda function .................................................................................................... 18
Step 2: Create a REST API .................................................................................................................. 19
Step 3: Create a Lambda proxy integration .................................................................................... 19

To create a Lambda function
Sign in to the Lambda console at 
Choose Create function.
For Function name, enter my-function.
For all other options, use the default setting.
Choose Create function.
The example function returns a 200 response to clients, and the text Hello from Lambda!.
You can modify your Lambda function, as long as the function's response aligns with the format 
that API Gateway requires.
The default Lambda function code should look similar to the following:
export const handler = async (event) => { 
    const response = { 
        statusCode: 200, 
        body: JSON.stringify('Hello from Lambda!'), 
    }; 
    return response;
};
Step 2: Create an HTTP API
Next, you create an HTTP API. API Gateway also supports REST APIs and WebSocket APIs, but an 
HTTP API is the best choice for this exercise. REST APIs support more features than HTTP APIs, but 
we don't need those features for this exercise. HTTP APIs are designed with minimal features so 
Step 1: Create a Lambda function
Amazon API Gateway
Developer Guide
that they can be oﬀered at a lower price. WebSocket APIs maintain persistent connections with 
clients for full-duplex communication, which isn't required for this example.
The HTTP API provides an HTTP endpoint for your Lambda function. API Gateway routes requests 
to your Lambda function, and then returns the function's response to clients.
To create an HTTP API
Sign in to the API Gateway console at 
Do one of the following:
•
To create your ﬁrst API, for HTTP API, choose Build.
•
If you've created an API before, choose Create API, and then choose Build for HTTP API.
For Integrations, choose Add integration.
Choose Lambda.
For Lambda function, enter my-function.
For API name, enter my-http-api.
Choose Next.
Review the route that API Gateway creates for you, and then choose Next.
Review the stage that API Gateway creates for you, and then choose Next.
10. Choose Create.

clients for full-duplex communication, which isn't required for this example.
The HTTP API provides an HTTP endpoint for your Lambda function. API Gateway routes requests 
to your Lambda function, and then returns the function's response to clients.
To create an HTTP API
Sign in to the API Gateway console at 
Do one of the following:
•
To create your ﬁrst API, for HTTP API, choose Build.
•
If you've created an API before, choose Create API, and then choose Build for HTTP API.
For Integrations, choose Add integration.
Choose Lambda.
For Lambda function, enter my-function.
For API name, enter my-http-api.
Choose Next.
Review the route that API Gateway creates for you, and then choose Next.
Review the stage that API Gateway creates for you, and then choose Next.
10. Choose Create.
Now you've created an HTTP API with a Lambda integration that's ready to receive requests from 
clients.
Step 3: Test your API
Next, you test your API to make sure that it's working. For simplicity, use a web browser to invoke 
your API.
To test your API
Sign in to the API Gateway console at 
Choose your API.
Note your API's invoke URL.
Step 3: Test your API
Amazon API Gateway
Developer Guide
Copy your API's invoke URL, and enter it in a web browser. Append the name of your Lambda 
function to your invoke URL to call your Lambda function. By default, the API Gateway console 
creates a route with the same name as your Lambda function, my-function.
The full URL should look like 
east-2.amazonaws.com/my-function.
Your browser sends a GET request to the API.
Verify your API's response. You should see the text "Hello from Lambda!" in your browser.
(Optional) Step 4: Clean up
To prevent unnecessary costs, delete the resources that you created as part of this getting 
started exercise. The following steps delete your HTTP API, your Lambda function, and associated 
resources.
To delete an HTTP API
Sign in to the API Gateway console at
`

**Generated Answer (Response):**
> 

The primary difference between `x-amazon-apigateway-authorizer` and `x-amazon-apigateway-authtype` in API Gateway is their purpose in authentication and authorization.

`x-amazon-apigateway-authorizer` is used to specify a custom authorizer function that API Gateway will call to authenticate and authorize access to an API. This custom authorizer function can be a Lambda function, for example, that verifies the identity of the caller and returns an IAM policy that defines the permissions for the caller.

`x-amazon-apigateway-authtype`, on the other hand, is used to specify the authentication type for an API. In this case, you would set it to `AWS_IAM` to indicate that API Gateway should use AWS IAM credentials to authenticate and authorize access to the API.

To implement these in a scenario where you need to authenticate and authorize access to a REST API using a custom authorizer function, while also specifying the authentication type as `AWS_IAM`, you would follow these steps:

1. Create a custom authorizer function (e.g., a Lambda function) that verifies the identity of the caller and returns an IAM policy that defines the permissions for the caller.
2. In your API Gateway REST API, specify the custom authorizer function using the `x-amazon-apigateway-authorizer` property.
3. Set the `x-amazon-apigateway-authtype` property to `AWS_IAM` to indicate that API Gateway should use AWS IAM credentials to authenticate and authorize access to the API.

Here's an example of how you might configure this in your API Gateway REST API:
```json
{
  "swagger": "2.0",
  "info": {
    "title": "My API",
    "description": "My API description",
    "version": "1.0"
  },
  "host": "execute-api.us-east-1.amazonaws.com",
  "basePath": "/dev",
  "schemes": [
    "https"
  ],
  "consumes": [
    "application/json"
  ],
  "produces": [
    "application/json"
  ],
  "paths": {
    "/myresource": {
      "get": {
        "summary": "Get my resource",
        "description": "Get my resource description",
        "responses": {
          "200": {
            "description": "OK"
          }
        },
        "security": [
          {
            "aws_iam": []
          }
        ],
        "x-amazon-apigateway-authtype": "AWS_IAM",
        "x-amazon-apigateway-authorizer": {
          "type": "REQUEST",
          "authorizerUri": "arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/arn:aws:lambda:us-east-1:123456789012:function:my-authorizer/invocations",
          "authorizerResultTtlInSeconds": 300
        }
      }
    }
  }
}
```
In this example, the `x-amazon-apigateway-authtype` property is set to `AWS_IAM`, and the `x-amazon-apigateway-authorizer` property specifies the custom authorizer function (a Lambda function) that will be called to authenticate and authorize access to the API.

**Scores:** Faithfulness: 1 | Relevance: 1 | Context Accuracy: 1

---

## Question 8
**Query:** What is the primary architectural distinction between an API Gateway-created REST API and an API Gateway-created HTTP API, and how does this distinction impact the design of API Gateway use cases?

**Ground Truth:**
> There is no primary architectural distinction between an API Gateway-created REST API and an API Gateway-created HTTP API mentioned in the provided text chunk. The text only mentions that API Gateway can be used to create both REST APIs and HTTP APIs, but it does not provide details on their architectural differences. Therefore, it is not possible to determine how this distinction would impact the design of API Gateway use cases.

**Retrieved Context (Proof):**
`	ext
Developer Guide
Amazon API Gateway
Copyright © 2026 Amazon Web Services, Inc. and/or its aﬃliates. All rights reserved.
Amazon API Gateway
Developer Guide
Amazon API Gateway: Developer Guide
Copyright © 2026 Amazon Web Services, Inc. and/or its aﬃliates. All rights reserved.
Amazon's trademarks and trade dress may not be used in connection with any product or service 
that is not Amazon's, in any manner that is likely to cause confusion among customers, or in any 
manner that disparages or discredits Amazon. All other trademarks not owned by Amazon are 
the property of their respective owners, who may or may not be aﬃliated with, connected to, or 
sponsored by Amazon.
Amazon API Gateway
Developer Guide
Table of Contents
What is Amazon API Gateway? ....................................................................................................... 1
Architecture of API Gateway ...................................................................................................................... 2
Features of API Gateway ............................................................................................................................. 2
API Gateway use cases ................................................................................................................................ 3
Use API Gateway to create REST APIs ................................................................................................ 3
Use API Gateway to create HTTP APIs ............................................................................................... 4
Use API Gateway to create WebSocket APIs ..................................................................................... 5
Who uses API Gateway? ........................................................................................................................ 5

API Gateway use cases ................................................................................................................................ 3
Use API Gateway to create REST APIs ................................................................................................ 3
Use API Gateway to create HTTP APIs ............................................................................................... 4
Use API Gateway to create WebSocket APIs ..................................................................................... 5
Who uses API Gateway? ........................................................................................................................ 5
Accessing API Gateway ................................................................................................................................ 6
Part of AWS serverless infrastructure ...................................................................................................... 7
How to get started with Amazon API Gateway ..................................................................................... 7
API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14

API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14
API management .................................................................................................................................. 15
Development .......................................................................................................................................... 15
Monitoring .............................................................................................................................................. 16
Integrations ............................................................................................................................................ 17
Get started with the REST API console ................................................................................................. 17
Step 1: Create a Lambda function .................................................................................................... 18
Step 2: Create a REST API .................................................................................................................. 19
Step 3: Create a Lambda proxy integration .................................................................................... 19

API Gateway HTTP APIs ............................................................................................................ 1159
Develop .................................................................................................................................................... 1159
Creating an HTTP API ..................................................................................................................... 1160
Routes ................................................................................................................................................. 1161
IP address types for HTTP APIs in API Gateway ........................................................................ 1164
Access control ................................................................................................................................... 1166
Integrations ....................................................................................................................................... 1185
CORS ................................................................................................................................................... 1203
Parameter mapping ......................................................................................................................... 1206
OpenAPI ............................................................................................................................................. 1213
Publish ..................................................................................................................................................... 1223
Stages ................................................................................................................................................. 1224
Security policy for HTTP APIs in API Gateway ........................................................................... 1226

x-amazon-apigateway-gateway-responses.responseTemplates .................................................. 1390
x-amazon-apigateway-gateway-responses.responseTemplates example ............................. 1391
x-amazon-apigateway-importexport-version .................................................................................. 1391
viii
Amazon API Gateway
Developer Guide
x-amazon-apigateway-importexport-version example ............................................................ 1391
x-amazon-apigateway-integration ........................................................................................ 1392
x-amazon-apigateway-integration examples ............................................................................. 1399
x-amazon-apigateway-integrations ................................................................................................... 1401
x-amazon-apigateway-integrations example ............................................................................. 1401
x-amazon-apigateway-integration.requestTemplates .................................................................... 1403
x-amazon-apigateway-integration.requestTemplates example .............................................. 1403
x-amazon-apigateway-integration.requestParameters .................................................................. 1404
x-amazon-apigateway-integration.requestParameters example ....................... 1405
x-amazon-apigateway-integration.responses .................................................................................. 1405
x-amazon-apigateway-integration.responses example ........................................... 1407
x-amazon-apigateway-integration.response .................................................................................... 1407
x-amazon-apigateway-integration.response example ............................................. 1409
`

**Generated Answer (Response):**
> 

The primary architectural distinction between an API Gateway-created REST API and an API Gateway-created HTTP API lies in their underlying architecture and design principles.

REST APIs in API Gateway are built on top of a resource-based architecture, where APIs are organized around resources and HTTP methods (GET, POST, PUT, DELETE, etc.) are used to interact with these resources. This approach is centered around the concept of resources, and the API is designed to manage these resources.

On the other hand, HTTP APIs in API Gateway are built on top of a route-based architecture, where APIs are organized around routes and HTTP methods are used to handle requests and responses. This approach is centered around the concept of routes, and the API is designed to handle requests and responses.

This distinction impacts the design of API Gateway use cases in the following ways:

1. Resource-based vs. Route-based: REST APIs are more suitable for use cases that involve managing resources, such as CRUD (Create, Read, Update, Delete) operations. HTTP APIs are more suitable for use cases that involve handling requests and responses, such as webhooks or real-time data streaming.

2. Complexity: REST APIs tend to be more complex and require more configuration, as they involve defining resources, methods, and integration with backend services. HTTP APIs are generally simpler and require less configuration, as they involve defining routes and handling requests and responses.

3. Performance: HTTP APIs tend to be more performant than REST APIs, as they eliminate the need for API Gateway to manage resources and focus solely on handling requests and responses.

4. Use Cases: REST APIs are suitable for use cases that require strong consistency, such as financial transactions or inventory management. HTTP APIs are suitable for use cases that require high performance and low latency, such as real-time analytics or live updates.

In summary, the primary architectural distinction between API Gateway-created REST APIs and HTTP APIs lies in their underlying architecture and design principles. This distinction impacts the design of API Gateway use cases, with REST APIs being more suitable for resource-based use cases and HTTP APIs being more suitable for route-based use cases.

**Scores:** Faithfulness: 1 | Relevance: 1 | Context Accuracy: 1

---

## Question 9
**Query:** What is the minimum number of distinct ways an API developer can create and manage an API in API Gateway, considering all the possible methods mentioned in the text, including console, CLI, SDK, CloudFormation templates, and OpenAPI extensions?

**Ground Truth:**
> 6

**Retrieved Context (Proof):**
`	ext
Developer Guide
Amazon API Gateway
Copyright © 2026 Amazon Web Services, Inc. and/or its aﬃliates. All rights reserved.
Amazon API Gateway
Developer Guide
Amazon API Gateway: Developer Guide
Copyright © 2026 Amazon Web Services, Inc. and/or its aﬃliates. All rights reserved.
Amazon's trademarks and trade dress may not be used in connection with any product or service 
that is not Amazon's, in any manner that is likely to cause confusion among customers, or in any 
manner that disparages or discredits Amazon. All other trademarks not owned by Amazon are 
the property of their respective owners, who may or may not be aﬃliated with, connected to, or 
sponsored by Amazon.
Amazon API Gateway
Developer Guide
Table of Contents
What is Amazon API Gateway? ....................................................................................................... 1
Architecture of API Gateway ...................................................................................................................... 2
Features of API Gateway ............................................................................................................................. 2
API Gateway use cases ................................................................................................................................ 3
Use API Gateway to create REST APIs ................................................................................................ 3
Use API Gateway to create HTTP APIs ............................................................................................... 4
Use API Gateway to create WebSocket APIs ..................................................................................... 5
Who uses API Gateway? ........................................................................................................................ 5

API Gateway use cases ................................................................................................................................ 3
Use API Gateway to create REST APIs ................................................................................................ 3
Use API Gateway to create HTTP APIs ............................................................................................... 4
Use API Gateway to create WebSocket APIs ..................................................................................... 5
Who uses API Gateway? ........................................................................................................................ 5
Accessing API Gateway ................................................................................................................................ 6
Part of AWS serverless infrastructure ...................................................................................................... 7
How to get started with Amazon API Gateway ..................................................................................... 7
API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14

API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14
API management .................................................................................................................................. 15
Development .......................................................................................................................................... 15
Monitoring .............................................................................................................................................. 16
Integrations ............................................................................................................................................ 17
Get started with the REST API console ................................................................................................. 17
Step 1: Create a Lambda function .................................................................................................... 18
Step 2: Create a REST API .................................................................................................................. 19
Step 3: Create a Lambda proxy integration .................................................................................... 19

method exposes the entire set of the publicly accessible HTTP resources and operations of a 
website. When the backend web server opens more resources for public access, the client can 
use these new resources with the same API setup. To enable this, the website developer must 
communicate clearly to the client developer what the new resources are and what operations are 
applicable for each of them.
Choose an HTTP integration tutorial
Amazon API Gateway
Developer Guide
As a quick introduction, the following tutorial demonstrates the HTTP proxy integration. In the 
tutorial, we create an API using the API Gateway console to integrate with the PetStore website 
through a generic proxy resource {proxy+}, and create the HTTP method placeholder of ANY.
Topics
• Create an API with HTTP proxy integration using the API Gateway console
• Test an API with HTTP proxy integration
Create an API with HTTP proxy integration using the API Gateway console
The following procedure walks you through the steps to create and test an API with a proxy 
resource for an HTTP backend using the API Gateway console. The HTTP backend is the PetStore
website ( from
Tutorial: Create a REST API with an HTTP non-proxy integration, in which screenshots are used 
as visual aids to illustrate the API Gateway UI elements. If you are new to using the API Gateway 
console to create an API, you may want to follow that section ﬁrst.
To create an API
Sign in to the API Gateway console at 
If this is your ﬁrst time using API Gateway, you see a page that introduces you to the features 
of the service. Under REST API, choose Build. When the Create Example API popup appears, 
choose OK.
If this is not your ﬁrst time using API Gateway, choose Create API. Under REST API, choose
Build.
For API name, enter HTTPProxyAPI.
(Optional) For Description, enter a description.
Keep API endpoint type set to Regional.
For IP address type, select IPv4.
Choose Create API.

An API developer works with the API Gateway service component for API management, named
apigateway, to create, conﬁgure, and deploy an API.
As an API developer, you can create and manage an API by using the API Gateway console, 
described in Get started with API Gateway, or by calling the API references. There are several ways 
to call this API. They include using the AWS Command Line Interface (AWS CLI), or by using an AWS 
SDK. In addition, you can enable API creation with AWS CloudFormation templates or (in the case 
of REST APIs and HTTP APIs) OpenAPI extensions for API Gateway.
For a list of Regions where API Gateway is available, as well as the associated control service 
endpoints, see Amazon API Gateway Endpoints and Quotas.
Calling an API Gateway API
An app developer works with the API Gateway service component for API execution, named
execute-api, to invoke an API that was created or deployed in API Gateway. The underlying 
programming entities are exposed by the created API. There are several ways to call such an API. To 
learn more, see Invoke REST APIs in API Gateway and Invoke WebSocket APIs.
Accessing API Gateway
You can access Amazon API Gateway in the following ways:
• AWS Management Console – The AWS Management Console provides a web interface for 
creating and managing APIs. After you complete the steps in Prerequisites, you can access the API 
Gateway console at 
• AWS SDKs – If you're using a programming language that AWS provides an SDK for, you can 
use an SDK to access API Gateway. SDKs simplify authentication, integrate easily with your 
development environment, and provide access to API Gateway commands. For more information, 
see Tools for Amazon Web Services.
Accessing API Gateway
Amazon API Gateway
Developer Guide
• API Gateway V1 and V2 APIs – If you're using a programming language that an SDK isn't 
available for, see the Amazon API Gateway Version 1 API Reference and Amazon API Gateway 
Version 2 API Reference.
`

**Generated Answer (Response):**
> 

According to the text, an API developer can create and manage an API in API Gateway using the following methods:

1. API Gateway console
2. AWS Command Line Interface (AWS CLI)
3. AWS SDK
4. AWS CloudFormation templates
5. OpenAPI extensions for API Gateway (only for REST APIs and HTTP APIs)

Therefore, the minimum number of distinct ways an API developer can create and manage an API in API Gateway is 5.

**Scores:** Faithfulness: 1 | Relevance: 1 | Context Accuracy: 1

---

## Question 10
**Query:** What is the minimum set of permissions required to be added to the IAM role 'GetStartedLambdaIntegrationRole' to allow the Lambda function to write logs to CloudWatch, assuming the Lambda function is deployed in the 'us-east-1' region and the log group name is '/aws/lambda/GetStartedLambdaIntegration', and considering the existing inline policies attached to the IAM role?

**Ground Truth:**
> The minimum set of permissions required is 'logs:CreateLogStream' and 'logs:PutLogEvents' on the resource 'arn:aws:logs:us-east-1:111111111111:log-group:/aws/lambda/GetStartedLambdaIntegration:*'. The 'logs:CreateLogGroup' permission is already provided by the existing inline policy.

**Retrieved Context (Proof):**
`	ext
API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14
API management .................................................................................................................................. 15
Development .......................................................................................................................................... 15
Monitoring .............................................................................................................................................. 16
Integrations ............................................................................................................................................ 17
Get started with the REST API console ................................................................................................. 17
Step 1: Create a Lambda function .................................................................................................... 18
Step 2: Create a REST API .................................................................................................................. 19
Step 3: Create a Lambda proxy integration .................................................................................... 19

Integrations ............................................................................................................................................ 17
Get started with the REST API console ................................................................................................. 17
Step 1: Create a Lambda function .................................................................................................... 18
Step 2: Create a REST API .................................................................................................................. 19
Step 3: Create a Lambda proxy integration .................................................................................... 19
Step 4: Deploy your API ...................................................................................................................... 20
Step 5: Invoke your API ....................................................................................................................... 20
(Optional) Step 6: Clean up ................................................................................................................ 21
Prerequisites .................................................................................................................................. 23
Sign up for an AWS account ................................................................................................................... 23
Get started ..................................................................................................................................... 24
Step 1: Create a Lambda function ......................................................................................................... 25
Step 2: Create an HTTP API ..................................................................................................................... 25

Prerequisites .................................................................................................................................. 23
Sign up for an AWS account ................................................................................................................... 23
Get started ..................................................................................................................................... 24
Step 1: Create a Lambda function ......................................................................................................... 25
Step 2: Create an HTTP API ..................................................................................................................... 25
Step 3: Test your API ................................................................................................................................ 26
(Optional) Step 4: Clean up ..................................................................................................................... 27
iii
Amazon API Gateway
Developer Guide
Next steps .................................................................................................................................................... 28
Tutorials and workshops ............................................................................................................... 30
REST API tutorials ...................................................................................................................................... 31
Choose a Lambda integration tutorial ............................................................................................. 31
Tutorial: Create a REST API by importing an example .................................................................. 55
Choose an HTTP integration tutorial ............................................................................................... 65

Complete the steps in Set up to use API Gateway.
Create a new API named MyDemoAPI. For more information, see Tutorial: Create a REST API 
with an HTTP non-proxy integration.
Deploy the API at least once to a stage named test. For more information, see Deploy the API
in Choose an AWS Lambda integration tutorial.
Complete the rest of the steps in Choose an AWS Lambda integration tutorial.
Create at least one topic in Amazon Simple Notiﬁcation Service (Amazon SNS). You will use the 
deployed API to get a list of topics in Amazon SNS that are associated with your AWS account. 
To learn how to create a topic in Amazon SNS, see Create a Topic. (You do not need to copy the 
topic ARN mentioned in step 5.)
Step 1: Create the AWS service proxy execution role
To allow the API to invoke Amazon SNS actions, you must have the appropriate IAM policies 
attached to an IAM role. In this step, you create a new IAM role.
To create the AWS service proxy execution role
Sign in to the AWS Management Console and open the IAM console at https:// 
console.aws.amazon.com/iam/.
Choose Roles.
Choose Create role.
Choose AWS service under Select type of trusted entity, and then select API Gateway and 
select Allows API Gateway to push logs to CloudWatch Logs.
Choose Next, and then choose Next.
For Role name, enter APIGatewaySNSProxyPolicy, and then choose Create role.
In the Roles list, choose the role you just created. You may need to scroll or use the search bar 
to ﬁnd the role.
Tutorial: Create a REST API with an AWS integration
Amazon API Gateway
Developer Guide
For the selected role, select the Add permissions tab.
Choose Attach policies from the dropdown list.
10. In the search bar, enter AmazonSNSReadOnlyAccess and choose Add permissions.
Note
This tutorial uses a managed policy for simplicity. As a best practice, you should create 
your own IAM policy to grant the minimum permissions required.
11. Note the newly created Role ARN, you will use it later.
Step 2: Create the resource

Quotas and important notes .................................................................................................... 1475
API Gateway account-level quotas, per Region ............................................................................... 1475
API Gateway quotas for creating, deploying and managing an API ............................................ 1476
x
Amazon API Gateway
Developer Guide
REST API quotas .................................................................................................................................... 1479
Best practices to reduce your quotas .......................................................................................... 1485
HTTP API quotas ................................................................................................................................... 1487
Best practices to reduce your quotas .......................................................................................... 1489
Portal quotas .......................................................................................................................................... 1490
WebSocket API quotas ......................................................................................................................... 1491
Important notes ..................................................................................................................................... 1493
Amazon API Gateway important notes for HTTP APIs ............................................................. 1493
Amazon API Gateway important notes for HTTP and WebSocket APIs ................................ 1494
Important notes for REST APIs and WebSocket APIs ............................................................... 1494
Important notes for WebSocket APIs .......................................................................................... 1494
`

**Generated Answer (Response):**
> 

The question is not related to the provided context, which is about API Gateway concepts, creating REST APIs and HTTP APIs, and tutorials for getting started with API Gateway. The question is about IAM roles and permissions for a Lambda function to write logs to CloudWatch, which is not mentioned in the provided context.

However, I can provide a general answer to the question. To allow a Lambda function to write logs to CloudWatch, the IAM role 'GetStartedLambdaIntegrationRole' needs to have the following minimum set of permissions:

* "logs:CreateLogGroup" to create a log group
* "logs:CreateLogStream" to create a log stream
* "logs:PutLogEvents" to write log events to the log stream

The IAM policy should look like this:
```
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:us-east-1:<account-id>:log-group:/aws/lambda/GetStartedLambdaIntegration"
    }
  ]
}
```
Replace `<account-id>` with the actual AWS account ID.

**Scores:** Faithfulness: 0 | Relevance: 1 | Context Accuracy: 0

---

## Question 11
**Query:** What is the primary implication of using a Lambda proxy integration in API Gateway, and how does it affect the deployment and testing of the API, considering the region where the Lambda function is created?

**Ground Truth:**
> The primary implication of using a Lambda proxy integration is that it allows for changes to the Lambda function implementation without needing to redeploy the API, providing flexibility and ease of maintenance. This is because the API Gateway acts as a proxy, forwarding requests to the Lambda function, and the Lambda function can be updated independently of the API. Furthermore, it is essential to note the region where the Lambda function is created, as it needs to be referenced when creating the API, ensuring that the API and Lambda function are in the same region to avoid latency and security issues.

**Retrieved Context (Proof):**
`	ext
Developer Guide
Amazon API Gateway
Copyright © 2026 Amazon Web Services, Inc. and/or its aﬃliates. All rights reserved.
Amazon API Gateway
Developer Guide
Amazon API Gateway: Developer Guide
Copyright © 2026 Amazon Web Services, Inc. and/or its aﬃliates. All rights reserved.
Amazon's trademarks and trade dress may not be used in connection with any product or service 
that is not Amazon's, in any manner that is likely to cause confusion among customers, or in any 
manner that disparages or discredits Amazon. All other trademarks not owned by Amazon are 
the property of their respective owners, who may or may not be aﬃliated with, connected to, or 
sponsored by Amazon.
Amazon API Gateway
Developer Guide
Table of Contents
What is Amazon API Gateway? ....................................................................................................... 1
Architecture of API Gateway ...................................................................................................................... 2
Features of API Gateway ............................................................................................................................. 2
API Gateway use cases ................................................................................................................................ 3
Use API Gateway to create REST APIs ................................................................................................ 3
Use API Gateway to create HTTP APIs ............................................................................................... 4
Use API Gateway to create WebSocket APIs ..................................................................................... 5
Who uses API Gateway? ........................................................................................................................ 5

API Gateway use cases ................................................................................................................................ 3
Use API Gateway to create REST APIs ................................................................................................ 3
Use API Gateway to create HTTP APIs ............................................................................................... 4
Use API Gateway to create WebSocket APIs ..................................................................................... 5
Who uses API Gateway? ........................................................................................................................ 5
Accessing API Gateway ................................................................................................................................ 6
Part of AWS serverless infrastructure ...................................................................................................... 7
How to get started with Amazon API Gateway ..................................................................................... 7
API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14

API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14
API management .................................................................................................................................. 15
Development .......................................................................................................................................... 15
Monitoring .............................................................................................................................................. 16
Integrations ............................................................................................................................................ 17
Get started with the REST API console ................................................................................................. 17
Step 1: Create a Lambda function .................................................................................................... 18
Step 2: Create a REST API .................................................................................................................. 19
Step 3: Create a Lambda proxy integration .................................................................................... 19

diﬀerent account from the account where you created your API.
Topics
• Tutorial: Create a REST API with a Lambda proxy integration
• Tutorial: Create a REST API with a Lambda non-proxy integration
• Tutorial: Create a REST API with a cross-account Lambda proxy integration
Tutorial: Create a REST API with a Lambda proxy integration
Lambda proxy integration is a lightweight, ﬂexible API Gateway API integration type that allows 
you to integrate an API method – or an entire API – with a Lambda function. The Lambda function 
can be written in any language that Lambda supports. Because it's a proxy integration, you can 
change the Lambda function implementation at any time without needing to redeploy your API.
In this tutorial, you do the following:
• Create a "Hello, World!" Lambda function to be the backend for the API.
• Create and test a "Hello, World!" API with Lambda proxy integration.
Topics
• Create a "Hello, World!" Lambda function
• Create a "Hello, World!" API
• Deploy and test the API
Create a "Hello, World!" Lambda function
To create a "Hello, World!" Lambda function in the Lambda console
Sign in to the Lambda console at 
On the AWS navigation bar, choose an AWS Region.
Choose a Lambda integration tutorial
Amazon API Gateway
Developer Guide
Note
Note the region where you create the Lambda function. You'll need it when you create 
the API.
Choose Functions in the navigation pane.
Choose Create function.
Choose Author from scratch.
Under Basic information, do the following:
a.
In Function name, enter GetStartedLambdaProxyIntegration.
b.
For Runtime, choose either the latest supported Node.js or Python runtime.
c.
For Architecture, keep the default setting.
d.
Under Permissions, expand Change default execution role. For Execution role dropdown 
list, choose Create new role from AWS policy templates.
e.
In Role name, enter GetStartedLambdaBasicExecutionRole.
f.
Leave the Policy templates ﬁeld blank.
g.
Choose Create function.

Choose an AWS Lambda integration tutorial
To build an API with Lambda integrations, you can use Lambda proxy integration or Lambda non-
proxy integration.
In Lambda proxy integration, the input to the Lambda function can be expressed as any 
combination of request headers, path variables, query string parameters, body, and API 
conﬁguration data. You only need to choose a Lambda function. API Gateway conﬁgures the 
integration request and integration response for you. Once set up, your API method can evolve 
without modifying the existing settings. This is possible because the backend Lambda function 
parses the incoming request data and responds to the client.
In Lambda non-proxy integration, you must ensure that input to the Lambda function is supplied 
as the integration request payload. You must map any input data the client supplied as request 
REST API tutorials
Amazon API Gateway
Developer Guide
parameters into the proper integration request body. You might also need to translate the client-
supplied request body into a format recognized by the Lambda function.
In either a Lambda proxy or a Lambda non-proxy integration, you can use a Lambda function in a 
diﬀerent account from the account where you created your API.
Topics
• Tutorial: Create a REST API with a Lambda proxy integration
• Tutorial: Create a REST API with a Lambda non-proxy integration
• Tutorial: Create a REST API with a cross-account Lambda proxy integration
Tutorial: Create a REST API with a Lambda proxy integration
Lambda proxy integration is a lightweight, ﬂexible API Gateway API integration type that allows 
you to integrate an API method – or an entire API – with a Lambda function. The Lambda function 
can be written in any language that Lambda supports. Because it's a proxy integration, you can 
change the Lambda function implementation at any time without needing to redeploy your API.
In this tutorial, you do the following:
`

**Generated Answer (Response):**
> 

The primary implication of using a Lambda proxy integration in API Gateway is that it allows you to change the Lambda function implementation at any time without needing to redeploy your API. This is because the input to the Lambda function can be expressed as any combination of request headers, path variables, query string parameters, body, and API configuration data, and API Gateway configures the integration request and integration response for you.

This affects the deployment and testing of the API in the following way: since the Lambda function can be modified without redeploying the API, you can evolve your API method without modifying the existing settings. However, it's important to note the region where the Lambda function is created, as you'll need to ensure that the API is deployed in the same region or configure cross-account access if the Lambda function is in a different account.

**Scores:** Faithfulness: 1 | Relevance: 1 | Context Accuracy: 1

---

## Question 12
**Query:** What is the specific syntax used in the Template body to access the 'callerName' property from the input JSON object, and how does it differ from the syntax used to access the 'city', 'time', and 'day' properties?

**Ground Truth:**
> The syntax used to access the 'callerName' property is '$inputRoot.callerName', which uses the '$inputRoot' variable to access the root of the input JSON object. This differs from the syntax used to access the 'city', 'time', and 'day' properties, which uses '$input.params('city')', '$input.params('time')', and '$input.params('day')' respectively, and relies on the '$input.params' object to access the method request parameters.

**Retrieved Context (Proof):**
`	ext
Developer Guide
Amazon API Gateway
Copyright © 2026 Amazon Web Services, Inc. and/or its aﬃliates. All rights reserved.
Amazon API Gateway
Developer Guide
Amazon API Gateway: Developer Guide
Copyright © 2026 Amazon Web Services, Inc. and/or its aﬃliates. All rights reserved.
Amazon's trademarks and trade dress may not be used in connection with any product or service 
that is not Amazon's, in any manner that is likely to cause confusion among customers, or in any 
manner that disparages or discredits Amazon. All other trademarks not owned by Amazon are 
the property of their respective owners, who may or may not be aﬃliated with, connected to, or 
sponsored by Amazon.
Amazon API Gateway
Developer Guide
Table of Contents
What is Amazon API Gateway? ....................................................................................................... 1
Architecture of API Gateway ...................................................................................................................... 2
Features of API Gateway ............................................................................................................................. 2
API Gateway use cases ................................................................................................................................ 3
Use API Gateway to create REST APIs ................................................................................................ 3
Use API Gateway to create HTTP APIs ............................................................................................... 4
Use API Gateway to create WebSocket APIs ..................................................................................... 5
Who uses API Gateway? ........................................................................................................................ 5

API Gateway use cases ................................................................................................................................ 3
Use API Gateway to create REST APIs ................................................................................................ 3
Use API Gateway to create HTTP APIs ............................................................................................... 4
Use API Gateway to create WebSocket APIs ..................................................................................... 5
Who uses API Gateway? ........................................................................................................................ 5
Accessing API Gateway ................................................................................................................................ 6
Part of AWS serverless infrastructure ...................................................................................................... 7
How to get started with Amazon API Gateway ..................................................................................... 7
API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14

Tutorials and workshops ............................................................................................................... 30
REST API tutorials ...................................................................................................................................... 31
Choose a Lambda integration tutorial ............................................................................................. 31
Tutorial: Create a REST API by importing an example .................................................................. 55
Choose an HTTP integration tutorial ............................................................................................... 65
Tutorial: Create a REST API with a private integration ................................................................. 79
Tutorial: Create a REST API with an AWS integration ................................................................... 85
Tutorial: Create a calculator REST API with three integrations ................................................... 91
Tutorial: Create a REST API as an Amazon S3 proxy .................................................................. 117
Tutorial: Create a REST API as an Amazon Kinesis proxy ........................................................... 162
Tutorial: Create a REST API using AWS SDKs or the AWS CLI ................................................... 207
Tutorial: Create a private REST API ................................................................................................ 241
HTTP API tutorials ................................................................................................................................... 247
Tutorial: Build a CRUD HTTP API with Lambda and DynamoDB .............................................. 247
Tutorial: Create an HTTP API with a private integration to Amazon ECS ................................ 260

header to ensure that all of the required data is deﬁned. For this example, you create a time
query string parameter and a day header.
For Request validator, select Validate query string parameters and headers.
Choose URL query string parameters and do the following:
a.
Choose Add query string.
b.
For Name, enter time.
Choose a Lambda integration tutorial
Amazon API Gateway
Developer Guide
c.
Turn on Required.
d.
Keep Caching turned oﬀ.
Choose HTTP request headers and do the following:
a.
Choose Add header.
b.
For Name, enter day.
c.
Turn on Required.
d.
Keep Caching turned oﬀ.
10. Choose Create method.
After turning on a request validator, you conﬁgure the integration request for the ANY method 
by adding a body-mapping template to transform the incoming request into a JSON payload, as 
required by the backend Lambda function.
To conﬁgure the integration request
On the Integration request tab, under the Integration request settings, choose Edit.
For Request body passthrough, select When there are no templates deﬁned 
(recommended).
Choose Mapping templates.
Choose Add mapping template.
For Content type, enter application/json.
For Template body, enter the following code:
#set($inputRoot = $input.path('$'))
{ 
  "city": "$input.params('city')", 
  "time": "$input.params('time')", 
  "day":  "$input.params('day')", 
  "name": "$inputRoot.callerName"
}
Choose Save.
Choose a Lambda integration tutorial
Amazon API Gateway
Developer Guide
Test invoking the API method
The API Gateway console provides a testing facility for you to test invoking the API before it is 
deployed. You use the Test feature of the console to test the API by submitting the following 
request:
POST /Seattle?time=morning
day:Wednesday
{ 
    "callerName": "John"
}
In this test request, you'll set ANY to POST, set {city} to Seattle, assign Wednesday as the day
header value, and assign "John" as the callerName value.
To test the ANY method

"description": "200 response", 
            "schema": { 
              "$ref": "#/definitions/Result" 
            } 
          } 
        }, 
        "x-amazon-apigateway-integration": { 
          "credentials": "arn:aws:iam::123456789012:role/apigAwsProxyRole", 
          "responses": { 
            "default": { 
              "statusCode": "200", 
Tutorial: Create a calculator REST API with three integrations
Amazon API Gateway
Developer Guide
              "responseTemplates": { 
                "application/json": "#set($inputRoot = $input.path('$'))\n{\n  
 \"input\" : {\n    \"a\" : $inputRoot.a,\n    \"b\" : $inputRoot.b,\n    \"op\" : 
 \"$inputRoot.op\"\n  },\n  \"output\" : {\n    \"c\" : $inputRoot.c\n  }\n}" 
              } 
            } 
          }, 
          "uri": "arn:aws:apigateway:us-west-2:lambda:path/2015-03-31/functions/
arn:aws:lambda:us-west-2:123456789012:function:Calc/invocations", 
          "passthroughBehavior": "when_no_templates", 
          "httpMethod": "POST", 
          "requestTemplates": { 
            "application/json": "{\n   \"a\": \"$input.params('operand1')\",
\n   \"b\": \"$input.params('operand2')\",\n   \"op\": 
 #if($input.params('operator')=='%2F')\"/\"#{else}\"$input.params('operator')\"#end
\n   \n}" 
          }, 
          "contentHandling": "CONVERT_TO_TEXT", 
          "type": "aws" 
        } 
      } 
    } 
  }, 
  "definitions": { 
    "Input": { 
      "type": "object", 
      "required": [ 
        "a", 
        "b", 
        "op" 
      ], 
      "properties": { 
        "a": { 
          "type": "number" 
        }, 
        "b": { 
          "type": "number" 
        }, 
        "op": { 
          "type": "string", 
          "description": "binary op of ['+', 'add', '-', 'sub', '*', 'mul', '%2F', 
 'div']" 
        } 
      }, 
Tutorial: Create a calculator REST API with three integrations
Amazon API Gateway
Developer Guide
      "title": "Input" 
    }, 
    "Output": {
`

**Generated Answer (Response):**
> 

The specific syntax used in the Template body to access the 'callerName' property from the input JSON object is:

`"name": "$inputRoot.callerName"`

This syntax uses `$inputRoot` to access the root of the input JSON object, and then uses the dot notation (`.`) to access the `callerName` property.

In contrast, the syntax used to access the 'city', 'time', and 'day' properties is:

`"city": "$input.params('city')"`
`"time": "$input.params('time')"`
`"day":  "$input.params('day')"`

This syntax uses `$input.params` to access the query string parameters or headers, and then uses the parentheses notation to specify the parameter name.

So, the main difference is that `$inputRoot` is used to access the JSON object body, while `$input.params` is used to access query string parameters or headers.

**Scores:** Faithfulness: 1 | Relevance: 1 | Context Accuracy: 1

---

## Question 13
**Query:** What is the primary reason why the API Gateway will not invoke the Lambda function 'Calc' when the 'op' parameter in the input JSON payload is set to a value other than one of the expected operands, despite the 'passthroughBehavior' being set to 'when_no_templates' in the integration request?

**Ground Truth:**
> The primary reason is that the response template in the integration response is using the 'set' function to assign the input parameters to the output JSON, which will only work correctly if the input JSON payload contains all the expected parameters (a, b, op, and c). If the 'op' parameter is set to an unexpected value, the response template will fail to render correctly, causing the API Gateway to return an error response instead of invoking the Lambda function.

**Retrieved Context (Proof):**
`	ext
Developer Guide
Amazon API Gateway
Copyright © 2026 Amazon Web Services, Inc. and/or its aﬃliates. All rights reserved.
Amazon API Gateway
Developer Guide
Amazon API Gateway: Developer Guide
Copyright © 2026 Amazon Web Services, Inc. and/or its aﬃliates. All rights reserved.
Amazon's trademarks and trade dress may not be used in connection with any product or service 
that is not Amazon's, in any manner that is likely to cause confusion among customers, or in any 
manner that disparages or discredits Amazon. All other trademarks not owned by Amazon are 
the property of their respective owners, who may or may not be aﬃliated with, connected to, or 
sponsored by Amazon.
Amazon API Gateway
Developer Guide
Table of Contents
What is Amazon API Gateway? ....................................................................................................... 1
Architecture of API Gateway ...................................................................................................................... 2
Features of API Gateway ............................................................................................................................. 2
API Gateway use cases ................................................................................................................................ 3
Use API Gateway to create REST APIs ................................................................................................ 3
Use API Gateway to create HTTP APIs ............................................................................................... 4
Use API Gateway to create WebSocket APIs ..................................................................................... 5
Who uses API Gateway? ........................................................................................................................ 5

API Gateway use cases ................................................................................................................................ 3
Use API Gateway to create REST APIs ................................................................................................ 3
Use API Gateway to create HTTP APIs ............................................................................................... 4
Use API Gateway to create WebSocket APIs ..................................................................................... 5
Who uses API Gateway? ........................................................................................................................ 5
Accessing API Gateway ................................................................................................................................ 6
Part of AWS serverless infrastructure ...................................................................................................... 7
How to get started with Amazon API Gateway ..................................................................................... 7
API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14

API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14
API management .................................................................................................................................. 15
Development .......................................................................................................................................... 15
Monitoring .............................................................................................................................................. 16
Integrations ............................................................................................................................................ 17
Get started with the REST API console ................................................................................................. 17
Step 1: Create a Lambda function .................................................................................................... 18
Step 2: Create a REST API .................................................................................................................. 19
Step 3: Create a Lambda proxy integration .................................................................................... 19

Choose Deploy API.
For Stage, select New stage.
For Stage name, enter Prod.
(Optional) For Description, enter a description.
Choose Deploy.
(Optional) Under Stage details, for Invoke URL, you can choose the copy icon to copy your 
API's invoke URL. You can use this with tools such as Postman and cURL to test your API.
Note
Always redeploy your API whenever you add, modify, or delete a resource or method, 
update a data mapping, or update stage settings. Otherwise, new features or updates will 
not be available to clients of your API.
OpenAPI deﬁnitions of sample API integrated with a Lambda function
OpenAPI 2.0
{ 
Tutorial: Create a calculator REST API with three integrations
Amazon API Gateway
Developer Guide
  "swagger": "2.0", 
  "info": { 
    "version": "2017-04-20T04:08:08Z", 
    "title": "LambdaCalc" 
  }, 
  "host": "uojnr9hd57.execute-api.us-east-1.amazonaws.com", 
  "basePath": "/test", 
  "schemes": [ 
    "https" 
  ], 
  "paths": { 
    "/calc": { 
      "get": { 
        "consumes": [ 
          "application/json" 
        ], 
        "produces": [ 
          "application/json" 
        ], 
        "parameters": [ 
          { 
            "name": "operand2", 
            "in": "query", 
            "required": true, 
            "type": "string" 
          }, 
          { 
            "name": "operator", 
            "in": "query", 
            "required": true, 
            "type": "string" 
          }, 
          { 
            "name": "operand1", 
            "in": "query", 
            "required": true, 
            "type": "string" 
          } 
        ], 
        "responses": { 
          "200": { 
            "description": "200 response", 
            "schema": { 
              "$ref": "#/definitions/Result" 
Tutorial: Create a calculator REST API with three integrations
Amazon API Gateway
Developer Guide
            }, 
            "headers": { 
              "operand_1": { 
                "type": "string" 
              },

endpoint. API Gateway responds with an overview of the PetStore website. This is an example of 
the MOCK integration type.
• GET /pets: for read access to the API's /pets resource that is integrated with the like-named 
backend /pets resource. The backend returns a page of available pets in the PetStore. This 
is an example of the HTTP integration type. The URL of the integration endpoint is http://
petstore-demo-endpoint.execute-api.com/petstore/pets.
Tutorial: Create a REST API by importing an example
Amazon API Gateway
Developer Guide
• POST /pets: for write access to the API's /pets resource that is integrated with the backend /
petstore/pets resource. Upon receiving a correct request, the backend adds the speciﬁed pet 
to the PetStore and returns the result to the caller. The integration is also HTTP.
• GET /pets/{petId}: for read access to a pet as identiﬁed by a petId value as speciﬁed as a 
path variable of the incoming request URL. This method also has the HTTP integration type. The 
backend returns the speciﬁed pet found in the PetStore. The URL of the backend HTTP endpoint 
is  where n is 
an integer as the identiﬁer of the queried pet.
The API supports CORS access via the OPTIONS methods of the MOCK integration type. API 
Gateway returns the required headers supporting CORS access.
The following procedure walks you through the steps to create and test an API from an example 
using the API Gateway Console.
To import, build, and test the example API
Sign in to the API Gateway console at 
Do one of the following:
•
To create your ﬁrst API, for REST API, choose Build.
•
If you've created an API before, choose Create API, and then choose Build for REST API.
Under Create REST API, choose Example API and then choose Create API to create the 
example API.
Tutorial: Create a REST API by importing an example
Amazon API Gateway
Developer Guide
You can scroll down the OpenAPI deﬁnition for details of this example API before choosing
Create API.

Integration has the following relationship: CONTAINS with Method
`

**Generated Answer (Response):**
> 

The primary reason why the API Gateway will not invoke the Lambda function 'Calc' when the 'op' parameter in the input JSON payload is set to a value other than one of the expected operands, despite the 'passthroughBehavior' being set to 'when_no_templates' in the integration request, is because the OpenAPI definition specifies that the 'operator' parameter is required and of type 'string'. If the 'op' parameter does not match one of the expected operands, the API Gateway will not pass the request to the Lambda function because the input does not conform to the defined API schema.

**Scores:** Faithfulness: 1 | Relevance: 1 | Context Accuracy: 1

---

## Question 14
**Query:** What type of API Gateway integration would you use to allow a client to securely access private API resources inside a VPC without exposing the resources to the public internet, and how would you configure it to pass the entire request and response between the frontend and an HTTP backend?

**Ground Truth:**
> You would use a private integration, which is an API Gateway integration type that allows a client to access resources inside a customer's VPC through a private REST API endpoint without exposing the resources to the public internet. To configure it, you would set up an HTTP proxy integration, which passes the entire request and response between the frontend and an HTTP backend.

**Retrieved Context (Proof):**
`	ext
Developer Guide
Amazon API Gateway
Copyright © 2026 Amazon Web Services, Inc. and/or its aﬃliates. All rights reserved.
Amazon API Gateway
Developer Guide
Amazon API Gateway: Developer Guide
Copyright © 2026 Amazon Web Services, Inc. and/or its aﬃliates. All rights reserved.
Amazon's trademarks and trade dress may not be used in connection with any product or service 
that is not Amazon's, in any manner that is likely to cause confusion among customers, or in any 
manner that disparages or discredits Amazon. All other trademarks not owned by Amazon are 
the property of their respective owners, who may or may not be aﬃliated with, connected to, or 
sponsored by Amazon.
Amazon API Gateway
Developer Guide
Table of Contents
What is Amazon API Gateway? ....................................................................................................... 1
Architecture of API Gateway ...................................................................................................................... 2
Features of API Gateway ............................................................................................................................. 2
API Gateway use cases ................................................................................................................................ 3
Use API Gateway to create REST APIs ................................................................................................ 3
Use API Gateway to create HTTP APIs ............................................................................................... 4
Use API Gateway to create WebSocket APIs ..................................................................................... 5
Who uses API Gateway? ........................................................................................................................ 5

API Gateway use cases ................................................................................................................................ 3
Use API Gateway to create REST APIs ................................................................................................ 3
Use API Gateway to create HTTP APIs ............................................................................................... 4
Use API Gateway to create WebSocket APIs ..................................................................................... 5
Who uses API Gateway? ........................................................................................................................ 5
Accessing API Gateway ................................................................................................................................ 6
Part of AWS serverless infrastructure ...................................................................................................... 7
How to get started with Amazon API Gateway ..................................................................................... 7
API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14

API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14
API management .................................................................................................................................. 15
Development .......................................................................................................................................... 15
Monitoring .............................................................................................................................................. 16
Integrations ............................................................................................................................................ 17
Get started with the REST API console ................................................................................................. 17
Step 1: Create a Lambda function .................................................................................................... 18
Step 2: Create a REST API .................................................................................................................. 19
Step 3: Create a Lambda proxy integration .................................................................................... 19

Part of AWS serverless infrastructure
Amazon API Gateway
Developer Guide
• Creating, deploying, and managing a WebSocket API to expose AWS Lambda functions or 
other AWS services.
• Invoking exposed API methods through the frontend HTTP and WebSocket endpoints.
API Gateway REST API
A collection of HTTP resources and methods that are integrated with backend HTTP endpoints, 
Lambda functions, or other AWS services. You can deploy this collection in one or more stages. 
Typically, API resources are organized in a resource tree according to the application logic. Each 
API resource can expose one or more API methods that have unique HTTP verbs supported by 
API Gateway. For more information, see the section called “Choose between REST APIs and 
HTTP APIs ”.
API Gateway HTTP API
A collection of routes and methods that are integrated with backend HTTP endpoints or 
Lambda functions. You can deploy this collection in one or more stages. Each route can expose 
one or more API methods that have unique HTTP verbs supported by API Gateway. For more 
information, see the section called “Choose between REST APIs and HTTP APIs ”.
API Gateway WebSocket API
A collection of WebSocket routes and route keys that are integrated with backend HTTP 
endpoints, Lambda functions, or other AWS services. You can deploy this collection in one or 
more stages. API methods are invoked through frontend WebSocket connections that you can 
associate with a registered custom domain name.
API deployment
A point-in-time snapshot of your API Gateway API. To be available for clients to use, the 
deployment must be associated with one or more API stages.
API developer
Your AWS account that owns an API Gateway deployment (for example, a service provider that 
also supports programmatic access).
API endpoint
A hostname for an API in API Gateway that is deployed to a speciﬁc Region. The hostname is of 
the form {api-id}.execute-api.{region}.amazonaws.com. The following types of API

Overview of WebSocket APIs .............................................................................................................. 1263
Use routes for a WebSocket API ................................................................................................... 1264
Send data to connected client apps ............................................................................................ 1265
WebSocket API status codes .......................................................................................................... 1265
Manage connected users and client apps ................................................................................... 1266
Invoke your backend integration .................................................................................................. 1269
WebSocket selection expressions ................................................................................................. 1273
Develop .................................................................................................................................................... 1281
Create and conﬁgure ....................................................................................................................... 1282
IP address types for WebSocket APIs in API Gateway .............................................................. 1283
Routes ................................................................................................................................................. 1285
Access control ................................................................................................................................... 1293
Integrations ....................................................................................................................................... 1302
Request validation ........................................................................................................................... 1311
`

**Generated Answer (Response):**
> 

To allow a client to securely access private API resources inside a VPC without exposing the resources to the public internet, you would use a REST API or HTTP API with a private integration.

To configure it to pass the entire request and response between the frontend and an HTTP backend, you would use a Lambda proxy integration.

Here's how you would configure it:

1. Create a REST API or HTTP API in API Gateway.
2. Create a private integration with the HTTP backend in your VPC.
3. Configure the integration to use a Lambda function as a proxy.
4. In the Lambda function, use the AWS SDK to call the private API resources in your VPC.
5. Configure the API Gateway to pass the entire request and response between the frontend and the Lambda function.

By using a private integration and a Lambda proxy, you can securely access private API resources inside a VPC without exposing them to the public internet. The Lambda function acts as a proxy, allowing API Gateway to communicate with the private API resources without exposing them directly to the internet.

**Scores:** Faithfulness: 1 | Relevance: 1 | Context Accuracy: 1

---

## Question 15
**Query:** What is the primary reason why the CloudFormation template used in Step 1 of this tutorial creates an Application Load Balancer as part of the Amazon ECS service, and how does this component interact with the VPC link V2 when the REST API is invoked?

**Ground Truth:**
> The primary reason is to provide a scalable and highly available entry point for the Amazon ECS service, allowing it to handle incoming traffic from the API Gateway. When the REST API is invoked, the API Gateway routes the request to the Application Load Balancer, which then distributes the traffic to the ECS containers running behind it. The VPC link V2 is used to establish a private connection between the API Gateway and the ECS service, ensuring that the traffic remains within the VPC and is not exposed to the public internet.

**Retrieved Context (Proof):**
`	ext
Developer Guide
Amazon API Gateway
Copyright © 2026 Amazon Web Services, Inc. and/or its aﬃliates. All rights reserved.
Amazon API Gateway
Developer Guide
Amazon API Gateway: Developer Guide
Copyright © 2026 Amazon Web Services, Inc. and/or its aﬃliates. All rights reserved.
Amazon's trademarks and trade dress may not be used in connection with any product or service 
that is not Amazon's, in any manner that is likely to cause confusion among customers, or in any 
manner that disparages or discredits Amazon. All other trademarks not owned by Amazon are 
the property of their respective owners, who may or may not be aﬃliated with, connected to, or 
sponsored by Amazon.
Amazon API Gateway
Developer Guide
Table of Contents
What is Amazon API Gateway? ....................................................................................................... 1
Architecture of API Gateway ...................................................................................................................... 2
Features of API Gateway ............................................................................................................................. 2
API Gateway use cases ................................................................................................................................ 3
Use API Gateway to create REST APIs ................................................................................................ 3
Use API Gateway to create HTTP APIs ............................................................................................... 4
Use API Gateway to create WebSocket APIs ..................................................................................... 5
Who uses API Gateway? ........................................................................................................................ 5

API Gateway use cases ................................................................................................................................ 3
Use API Gateway to create REST APIs ................................................................................................ 3
Use API Gateway to create HTTP APIs ............................................................................................... 4
Use API Gateway to create WebSocket APIs ..................................................................................... 5
Who uses API Gateway? ........................................................................................................................ 5
Accessing API Gateway ................................................................................................................................ 6
Part of AWS serverless infrastructure ...................................................................................................... 7
How to get started with Amazon API Gateway ..................................................................................... 7
API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14

API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14
API management .................................................................................................................................. 15
Development .......................................................................................................................................... 15
Monitoring .............................................................................................................................................. 16
Integrations ............................................................................................................................................ 17
Get started with the REST API console ................................................................................................. 17
Step 1: Create a Lambda function .................................................................................................... 18
Step 2: Create a REST API .................................................................................................................. 19
Step 3: Create a Lambda proxy integration .................................................................................... 19

created. In subsequent sections, you'll add resources and methods to it.
Tutorial: Create a calculator REST API with three integrations
Amazon API Gateway
Developer Guide
To create an API
Sign in to the API Gateway console at 
If this is your ﬁrst time using API Gateway, you see a page that introduces you to the features 
of the service. Under REST API, choose Build. When the Create Example API popup appears, 
choose OK.
If this is not your ﬁrst time using API Gateway, choose Create API. Under REST API, choose
Build.
For API name, enter LambdaCalc.
(Optional) For Description, enter a description.
Keep API endpoint type set to Regional.
For IP address type, select IPv4.
Choose Create API.
Integration 1: Create a GET method with query parameters to call the Lambda 
function
By creating a GET method that passes query string parameters to the Lambda function, you enable 
the API to be invoked from a browser. This approach can be useful, especially for APIs that allow 
open access.
After you create an API, you create a resource. Typically, API resources are organized in a resource 
tree according to the application logic. For this step, you create a /calc resource.
To create a /calc resource
Choose Create resource.
Keep Proxy resource turned oﬀ.
Keep Resource path as /.
For Resource name, enter calc.
Keep CORS (Cross Origin Resource Sharing) turned oﬀ.
Choose Create resource.
Tutorial: Create a calculator REST API with three integrations
Amazon API Gateway
Developer Guide
By creating a GET method that passes query string parameters to the Lambda function, you enable 
the API to be invoked from a browser. This approach can be useful, especially for APIs that allow 
open access.
In this method, Lambda requires that the POST request be used to invoke any Lambda function. 
This example shows that the HTTP method in a frontend method request can be diﬀerent from the 
integration request in the backend.
To create a GET method

LambdaCalc (abc123).
{ 
    "type":"object", 
    "properties":{ 
        "input":{ 
            "$ref":"
input" 
        }, 
Tutorial: Create a calculator REST API with three integrations
Amazon API Gateway
Developer Guide
        "output":{ 
            "$ref":"
output" 
        } 
    }, 
    "title":"result"
}
Choose Create model.
You now conﬁgure the method request of your POST method to enable request validation on the 
incoming request body.
To enable request validation on the POST method
In the main navigation pane, choose Resources, and then select the POST method from the 
resource tree.
On the Method request tab, under Method request settings, choose Edit.
For Request validator, select Validate body.
Choose Request body, and then choose Add model.
For Content type, enter application/json.
If no matching content type is found, request validation is not performed. To use the same 
model regardless of the content type, enter $default.
For Model, select input.
Choose Save.
You can now test your POST method to verify that it has been properly set up to invoke the 
Lambda function.
To test the POST method
Choose the Test tab. You might need to choose the right arrow button to show the tab.
For Request body, enter the following JSON payload.
{ 
    "a": 1, 
Tutorial: Create a calculator REST API with three integrations
Amazon API Gateway
Developer Guide
    "b": 2, 
    "op": "+"
} 
Choose Test.
You should see the following output:
{ 
  "a": 1, 
  "b": 2, 
  "op": "+", 
  "c": 3
}                     
Integration 3: Create a GET method with path parameters to call the Lambda 
function
Now you'll create a GET method on a resource speciﬁed by a sequence of path parameters to call 
the backend Lambda function. The path parameter values specify the input data to the Lambda 
function. You'll use a mapping template to map the incoming path parameter values to the 
required integration request payload.
The resulting API resource structure will look like this:
`

**Generated Answer (Response):**
> 

There is no mention of CloudFormation, Application Load Balancer, Amazon ECS, or VPC link V2 in the provided context. The tutorial only discusses creating a REST API using Amazon API Gateway and integrating it with a Lambda function. Therefore, it is not possible to answer this question based on the provided context.

**Scores:** Faithfulness: 1 | Relevance: 0 | Context Accuracy: 0

---

## Question 16
**Query:** What is the primary reason why the API Gateway REST API with a VPC link V2 is able to successfully access the Amazon ECS service running in an Amazon VPC, despite the ECS service not being directly exposed to the public internet?

**Ground Truth:**
> The primary reason is that the API Gateway uses a VPC proxy integration, which allows it to send requests to the private IP address of the load balancer created in Step 1, which in turn forwards the requests to the ECS service running in the VPC.

**Retrieved Context (Proof):**
`	ext
Developer Guide
Amazon API Gateway
Copyright © 2026 Amazon Web Services, Inc. and/or its aﬃliates. All rights reserved.
Amazon API Gateway
Developer Guide
Amazon API Gateway: Developer Guide
Copyright © 2026 Amazon Web Services, Inc. and/or its aﬃliates. All rights reserved.
Amazon's trademarks and trade dress may not be used in connection with any product or service 
that is not Amazon's, in any manner that is likely to cause confusion among customers, or in any 
manner that disparages or discredits Amazon. All other trademarks not owned by Amazon are 
the property of their respective owners, who may or may not be aﬃliated with, connected to, or 
sponsored by Amazon.
Amazon API Gateway
Developer Guide
Table of Contents
What is Amazon API Gateway? ....................................................................................................... 1
Architecture of API Gateway ...................................................................................................................... 2
Features of API Gateway ............................................................................................................................. 2
API Gateway use cases ................................................................................................................................ 3
Use API Gateway to create REST APIs ................................................................................................ 3
Use API Gateway to create HTTP APIs ............................................................................................... 4
Use API Gateway to create WebSocket APIs ..................................................................................... 5
Who uses API Gateway? ........................................................................................................................ 5

API Gateway use cases ................................................................................................................................ 3
Use API Gateway to create REST APIs ................................................................................................ 3
Use API Gateway to create HTTP APIs ............................................................................................... 4
Use API Gateway to create WebSocket APIs ..................................................................................... 5
Who uses API Gateway? ........................................................................................................................ 5
Accessing API Gateway ................................................................................................................................ 6
Part of AWS serverless infrastructure ...................................................................................................... 7
How to get started with Amazon API Gateway ..................................................................................... 7
API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14

API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14
API management .................................................................................................................................. 15
Development .......................................................................................................................................... 15
Monitoring .............................................................................................................................................. 16
Integrations ............................................................................................................................................ 17
Get started with the REST API console ................................................................................................. 17
Step 1: Create a Lambda function .................................................................................................... 18
Step 2: Create a REST API .................................................................................................................. 19
Step 3: Create a Lambda proxy integration .................................................................................... 19

For Choose a VPC link version, select VPC link V2.
For Name, enter private-integrations-tutorial.
For VPC, choose the VPC that you created in step 1. The name should start with RestApiStack.
For Subnets, select the two private subnets in your VPC. Their names end with
PrivateSubnet.
Tutorial: Create a REST API with a private integration
Amazon API Gateway
Developer Guide
For Security groups, select the Group ID that starts with private-integrations-
tutorial and has the description of RestApiStack/RestApiTutorialService/
Service/SecurityGroup.
Choose Create.
After you create your VPC link V2, API Gateway provisions Elastic Network Interfaces to access your 
VPC. The process can take a few minutes. In the meantime, you can create your API.
Step 3: Create a REST API
The REST API provides an HTTP endpoint for your Amazon ECS service.
To create a REST API
Sign in to the API Gateway console at 
Choose Create API, and then for REST API, choose Build.
For Name, enter private-integration-api.
For IP address type, select IPv4.
Choose Create API.
After you create your API, you create a method.
Choose Create method, and then do the following:
a.
For Method type, select GET.
b.
For Integration type, select VPC link.
c.
Turn on VPC proxy integration.
d.
For HTTP method, select GET.
e.
For VPC link, choose the VPC link V2 you created in the previous step.
f.
For Integration target, enter the load balancer that you created with the CloudFormation 
template in Step 1. It's name should start with rest-.
g.
For Endpoint URL, enter 
The URL is used to set the Host header of the integration request. In this case, the host 
header is private-integrations-tutorial.
h.
Choose Create method.
Tutorial: Create a REST API with a private integration
Amazon API Gateway
Developer Guide
With the proxy integration, the API is ready to test.
Step 4: Test your API
Next, you test invoking the API method.
To test your API
Sign in to the API Gateway console at 
Choose your API.

For more information about API Gateway WebSocket APIs, see the section called “Use API Gateway 
to create WebSocket APIs” and the section called “Overview of WebSocket APIs”.
Topics
• Architecture of API Gateway
• Features of API Gateway
• API Gateway use cases
• Accessing API Gateway
• Part of AWS serverless infrastructure
• How to get started with Amazon API Gateway
Amazon API Gateway
Developer Guide
• Amazon API Gateway concepts
• Choose between REST APIs and HTTP APIs
• Get started with the REST API console
Architecture of API Gateway
The following diagram shows API Gateway architecture.
This diagram illustrates how the APIs you build in Amazon API Gateway provide you or your 
developer customers with an integrated and consistent developer experience for building AWS 
serverless applications. API Gateway handles all the tasks involved in accepting and processing 
up to hundreds of thousands of concurrent API calls. These tasks include traﬃc management, 
authorization and access control, monitoring, and API version management.
API Gateway acts as a "front door" for applications to access data, business logic, or functionality 
from your backend services, such as workloads running on Amazon Elastic Compute Cloud 
(Amazon EC2), code running on AWS Lambda, any web application, or real-time communication 
applications.
Features of API Gateway
Amazon API Gateway oﬀers features such as the following:
Architecture of API Gateway
Amazon API Gateway
Developer Guide
• Support for stateful (WebSocket) and stateless (HTTP and REST) APIs.
• Powerful, ﬂexible authentication mechanisms, such as AWS Identity and Access Management 
policies, Lambda authorizer functions, and Amazon Cognito user pools.
• Canary release deployments for safely rolling out changes.
• CloudTrail logging and monitoring of API usage and API changes.
• CloudWatch access logging and execution logging, including the ability to set alarms. For more
`

**Generated Answer (Response):**
> 

The primary reason why the API Gateway REST API with a VPC link V2 is able to successfully access the Amazon ECS service running in an Amazon VPC, despite the ECS service not being directly exposed to the public internet, is because API Gateway provisions Elastic Network Interfaces (ENIs) to access the VPC. This allows API Gateway to privately integrate with the ECS service within the VPC, without requiring the ECS service to be exposed to the public internet.

**Scores:** Faithfulness: 1 | Relevance: 1 | Context Accuracy: 1

---

## Question 17
**Query:** What is the maximum allowed size of the request body that can be sent to the Lambda function 'GetStartedLambdaIntegration' in this API Gateway setup, considering the API Gateway's default payload limit and the additional overhead introduced by the X-Amz-Security-Token header, and how would you modify the API Gateway configuration to increase this limit if necessary?

**Ground Truth:**
> The maximum allowed size of the request body is 6.4 MB (API Gateway's default payload limit) minus the size of the X-Amz-Security-Token header, which is approximately 4.5 KB in this case, resulting in a maximum allowed request body size of around 6.3 MB. To increase this limit, you would need to modify the API Gateway configuration by setting the 'maximumIntegrationRequestSize' property to a higher value, up to a maximum of 10 MB, in the API Gateway REST API or using the AWS CLI.

**Retrieved Context (Proof):**
`	ext
Developer Guide
Amazon API Gateway
Copyright © 2026 Amazon Web Services, Inc. and/or its aﬃliates. All rights reserved.
Amazon API Gateway
Developer Guide
Amazon API Gateway: Developer Guide
Copyright © 2026 Amazon Web Services, Inc. and/or its aﬃliates. All rights reserved.
Amazon's trademarks and trade dress may not be used in connection with any product or service 
that is not Amazon's, in any manner that is likely to cause confusion among customers, or in any 
manner that disparages or discredits Amazon. All other trademarks not owned by Amazon are 
the property of their respective owners, who may or may not be aﬃliated with, connected to, or 
sponsored by Amazon.
Amazon API Gateway
Developer Guide
Table of Contents
What is Amazon API Gateway? ....................................................................................................... 1
Architecture of API Gateway ...................................................................................................................... 2
Features of API Gateway ............................................................................................................................. 2
API Gateway use cases ................................................................................................................................ 3
Use API Gateway to create REST APIs ................................................................................................ 3
Use API Gateway to create HTTP APIs ............................................................................................... 4
Use API Gateway to create WebSocket APIs ..................................................................................... 5
Who uses API Gateway? ........................................................................................................................ 5

API Gateway use cases ................................................................................................................................ 3
Use API Gateway to create REST APIs ................................................................................................ 3
Use API Gateway to create HTTP APIs ............................................................................................... 4
Use API Gateway to create WebSocket APIs ..................................................................................... 5
Who uses API Gateway? ........................................................................................................................ 5
Accessing API Gateway ................................................................................................................................ 6
Part of AWS serverless infrastructure ...................................................................................................... 7
How to get started with Amazon API Gateway ..................................................................................... 7
API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14

API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14
API management .................................................................................................................................. 15
Development .......................................................................................................................................... 15
Monitoring .............................................................................................................................................. 16
Integrations ............................................................................................................................................ 17
Get started with the REST API console ................................................................................................. 17
Step 1: Create a Lambda function .................................................................................................... 18
Step 2: Create a REST API .................................................................................................................. 19
Step 3: Create a Lambda proxy integration .................................................................................... 19

header to ensure that all of the required data is deﬁned. For this example, you create a time
query string parameter and a day header.
For Request validator, select Validate query string parameters and headers.
Choose URL query string parameters and do the following:
a.
Choose Add query string.
b.
For Name, enter time.
Choose a Lambda integration tutorial
Amazon API Gateway
Developer Guide
c.
Turn on Required.
d.
Keep Caching turned oﬀ.
Choose HTTP request headers and do the following:
a.
Choose Add header.
b.
For Name, enter day.
c.
Turn on Required.
d.
Keep Caching turned oﬀ.
10. Choose Create method.
After turning on a request validator, you conﬁgure the integration request for the ANY method 
by adding a body-mapping template to transform the incoming request into a JSON payload, as 
required by the backend Lambda function.
To conﬁgure the integration request
On the Integration request tab, under the Integration request settings, choose Edit.
For Request body passthrough, select When there are no templates deﬁned 
(recommended).
Choose Mapping templates.
Choose Add mapping template.
For Content type, enter application/json.
For Template body, enter the following code:
#set($inputRoot = $input.path('$'))
{ 
  "city": "$input.params('city')", 
  "time": "$input.params('time')", 
  "day":  "$input.params('day')", 
  "name": "$inputRoot.callerName"
}
Choose Save.
Choose a Lambda integration tutorial
Amazon API Gateway
Developer Guide
Test invoking the API method
The API Gateway console provides a testing facility for you to test invoking the API before it is 
deployed. You use the Test feature of the console to test the API by submitting the following 
request:
POST /Seattle?time=morning
day:Wednesday
{ 
    "callerName": "John"
}
In this test request, you'll set ANY to POST, set {city} to Seattle, assign Wednesday as the day
header value, and assign "John" as the callerName value.
To test the ANY method

Allow actions based on resource tags ......................................................................................... 1468
Deny tagging operations ................................................................................................................ 1469
Allow tagging operations ............................................................................................................... 1470
API references ............................................................................................................................ 1471
API Gateway service endpoints .......................................................................................................... 1471
IPv4 endpoints .................................................................................................................................. 1471
Dualstack (IPv4 and IPv6) endpoints ........................................................................................... 1472
Specifying endpoints ....................................................................................................................... 1472
Using IPv6 addresses in IAM policies ................................................................................................ 1473
Quotas and important notes .................................................................................................... 1475
API Gateway account-level quotas, per Region ............................................................................... 1475
API Gateway quotas for creating, deploying and managing an API ............................................ 1476
x
Amazon API Gateway
Developer Guide
REST API quotas .................................................................................................................................... 1479
Best practices to reduce your quotas .......................................................................................... 1485
`

**Generated Answer (Response):**
> 

The question is asking about the maximum allowed size of the request body that can be sent to the Lambda function 'GetStartedLambdaIntegration' in this API Gateway setup.

According to the AWS documentation, the default payload limit for API Gateway is 10 MB. However, this limit can be increased up to 30 MB by configuring the API Gateway to handle larger payloads.

In this specific setup, the request body is being transformed into a JSON payload using a body-mapping template, which adds some overhead. Additionally, the X-Amz-Security-Token header is also included, which adds some extra bytes to the request.

To calculate the maximum allowed size of the request body, we need to subtract the overhead introduced by the body-mapping template and the X-Amz-Security-Token header from the default payload limit.

Assuming the overhead is approximately 500 bytes (a rough estimate), the maximum allowed size of the request body would be:

10 MB (default payload limit) - 500 bytes (overhead) = approximately 9.5 MB

If you need to increase this limit, you can modify the API Gateway configuration by setting the `payloadSize` property to a value up to 30 MB in the API Gateway REST API or HTTP API settings. This can be done using the AWS Management Console, AWS CLI, or AWS SDKs.

For example, using the AWS CLI, you can update the API Gateway REST API settings with the following command:
```
aws apigateway update-rest-api --rest-api-id <api-id> --patch-operations op=replace,path=/payloadSize,value=30000000
```
Replace `<api-id>` with the ID of your API Gateway REST API.

Note that increasing the payload limit may impact performance and should be done with caution. It's essential to consider the trade-offs and ensure that your API Gateway and Lambda function can handle larger payloads efficiently.

**Scores:** Faithfulness: 1 | Relevance: 1 | Context Accuracy: 1

---

## Question 18
**Query:** What is the primary advantage of using a Lambda proxy integration in an API Gateway REST API, and how does it enable serverless APIs to focus on application logic instead of provisioning and managing servers?

**Ground Truth:**
> The primary advantage of using a Lambda proxy integration is that it allows API Gateway to route requests to a Lambda function, which runs the function and returns a response to API Gateway, thereby enabling serverless APIs to focus on application logic instead of provisioning and managing servers, as Lambda runs the code only when needed and scales automatically.

**Retrieved Context (Proof):**
`	ext
Developer Guide
Amazon API Gateway
Copyright © 2026 Amazon Web Services, Inc. and/or its aﬃliates. All rights reserved.
Amazon API Gateway
Developer Guide
Amazon API Gateway: Developer Guide
Copyright © 2026 Amazon Web Services, Inc. and/or its aﬃliates. All rights reserved.
Amazon's trademarks and trade dress may not be used in connection with any product or service 
that is not Amazon's, in any manner that is likely to cause confusion among customers, or in any 
manner that disparages or discredits Amazon. All other trademarks not owned by Amazon are 
the property of their respective owners, who may or may not be aﬃliated with, connected to, or 
sponsored by Amazon.
Amazon API Gateway
Developer Guide
Table of Contents
What is Amazon API Gateway? ....................................................................................................... 1
Architecture of API Gateway ...................................................................................................................... 2
Features of API Gateway ............................................................................................................................. 2
API Gateway use cases ................................................................................................................................ 3
Use API Gateway to create REST APIs ................................................................................................ 3
Use API Gateway to create HTTP APIs ............................................................................................... 4
Use API Gateway to create WebSocket APIs ..................................................................................... 5
Who uses API Gateway? ........................................................................................................................ 5

API Gateway use cases ................................................................................................................................ 3
Use API Gateway to create REST APIs ................................................................................................ 3
Use API Gateway to create HTTP APIs ............................................................................................... 4
Use API Gateway to create WebSocket APIs ..................................................................................... 5
Who uses API Gateway? ........................................................................................................................ 5
Accessing API Gateway ................................................................................................................................ 6
Part of AWS serverless infrastructure ...................................................................................................... 7
How to get started with Amazon API Gateway ..................................................................................... 7
API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14

API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14
API management .................................................................................................................................. 15
Development .......................................................................................................................................... 15
Monitoring .............................................................................................................................................. 16
Integrations ............................................................................................................................................ 17
Get started with the REST API console ................................................................................................. 17
Step 1: Create a Lambda function .................................................................................................... 18
Step 2: Create a REST API .................................................................................................................. 19
Step 3: Create a Lambda proxy integration .................................................................................... 19

from your backend services, such as workloads running on Amazon Elastic Compute Cloud 
(Amazon EC2), code running on AWS Lambda, any web application, or real-time communication 
applications.
Features of API Gateway
Amazon API Gateway oﬀers features such as the following:
Architecture of API Gateway
Amazon API Gateway
Developer Guide
• Support for stateful (WebSocket) and stateless (HTTP and REST) APIs.
• Powerful, ﬂexible authentication mechanisms, such as AWS Identity and Access Management 
policies, Lambda authorizer functions, and Amazon Cognito user pools.
• Canary release deployments for safely rolling out changes.
• CloudTrail logging and monitoring of API usage and API changes.
• CloudWatch access logging and execution logging, including the ability to set alarms. For more 
information, see the section called “CloudWatch metrics” and the section called “Metrics”.
• Ability to use CloudFormation templates to enable API creation. For more information, see
Amazon API Gateway Resource Types Reference and Amazon API Gateway V2 Resource Types 
Reference.
• Support for custom domain names.
• Integration with AWS WAF for protecting your APIs against common web exploits.
• Integration with AWS X-Ray for understanding and triaging performance latencies.
For a complete list of API Gateway feature releases, see Document history.
API Gateway use cases
The following use cases section presents an overview of the diﬀerent types of API Gateway APIs 
and the diﬀerent kinds of developers who use API Gateway. For more detailed information about 
the diﬀerence between REST APIs and HTTP APIs, see the section called “Choose between REST 
APIs and HTTP APIs ”.
Topics
• Use API Gateway to create REST APIs
• Use API Gateway to create HTTP APIs
• Use API Gateway to create WebSocket APIs
• Who uses API Gateway?
Use API Gateway to create REST APIs
An API Gateway REST API is made up of resources and methods. A resource is a logical entity that

Amazon API Gateway
Developer Guide
Features
REST API
HTTP API
Test invocations
 Yes
 No
Caching
 Yes
 No
User-controlled deployments
 Yes
 Yes
Automatic deployments
 No
 Yes
Custom gateway responses
 Yes
 No
Canary release deployments
 Yes
 No
Request validation
 Yes
 No
Request parameter transform 
ation
 Yes
 Yes
Request body transformation
 Yes
 No
Monitoring
API Gateway supports several options to log API requests and monitor your APIs. For more 
information, see the section called “Monitor” and the section called “Monitor”.
Feature
REST API
HTTP API
Amazon CloudWatch metrics
 Yes
 Yes
Access logs to CloudWatch 
Logs
 Yes
 Yes
Access logs to Amazon Data 
Firehose
 Yes
 No
Execution logs
 Yes
 No
AWS X-Ray tracing
 Yes
 No
Monitoring
Amazon API Gateway
Developer Guide
Integrations
Integrations connect your API Gateway API to backend resources. For more information, see the 
section called “Integrations” and the section called “Integrations”.
Feature
REST API
HTTP API
Public HTTP endpoints
 Yes
 Yes
AWS services
 Yes
 Yes
AWS Lambda functions
 Yes
 Yes
Private integrations with 
Network Load Balancers
 Yes
 Yes
Private integrations with 
Application Load Balancers
 Yes
 Yes
Private integrations with AWS 
Cloud Map
 No
 Yes
Mock integrations
 Yes
 No
Response streaming
 Yes
 No
Get started with the REST API console
In this getting started exercise, you create a serverless REST API using the API Gateway REST 
API console. Serverless APIs let you focus on your applications instead of spending your time 
provisioning and managing servers. This exercise should take less than 20 minutes to complete, 
and is possible within the AWS Free Tier.
First, you create a Lambda function using the Lambda console. Next, you create a REST API using 
the API Gateway REST API console. Then, you create an API method and integrate it with a Lambda 
function using a Lambda proxy integration. Finally, you deploy and invoke your API.
Integrations
Amazon API Gateway
Developer Guide
`

**Generated Answer (Response):**
> 

The primary advantage of using a Lambda proxy integration in an API Gateway REST API is that it allows the API to focus on application logic instead of provisioning and managing servers. This is because Lambda functions, which are serverless, handle the backend logic, and API Gateway handles the API management and routing. 

With a Lambda proxy integration, API Gateway acts as a proxy, passing the entire request and response to and from the Lambda function. This allows the API to offload the processing of the request to the Lambda function, which can then execute the necessary logic without the need for provisioning or managing servers. 

As a result, developers can focus on writing application code and logic, without worrying about the underlying infrastructure, which enables serverless APIs to focus on application logic instead of provisioning and managing servers.

**Scores:** Faithfulness: 1 | Relevance: 1 | Context Accuracy: 1

---

## Question 19
**Query:** What is the specific Condition clause in the Allow policy that is generated when creating a Lambda function with an API Gateway REST API, and how does it relate to the ARN of the API's GET method, considering the PetStore example API's integration with an HTTP backend website?

**Ground Truth:**
> The Condition clause in the Allow policy is 'AWS:SourceArn' which is the ARN for the API's GET method, specifically 'arn:aws:execute-api:<region>:<account-id>:<api-id>/GET/' which restricts the Lambda function to only be invoked by the specified API's GET method.

**Retrieved Context (Proof):**
`	ext
Developer Guide
Amazon API Gateway
Copyright © 2026 Amazon Web Services, Inc. and/or its aﬃliates. All rights reserved.
Amazon API Gateway
Developer Guide
Amazon API Gateway: Developer Guide
Copyright © 2026 Amazon Web Services, Inc. and/or its aﬃliates. All rights reserved.
Amazon's trademarks and trade dress may not be used in connection with any product or service 
that is not Amazon's, in any manner that is likely to cause confusion among customers, or in any 
manner that disparages or discredits Amazon. All other trademarks not owned by Amazon are 
the property of their respective owners, who may or may not be aﬃliated with, connected to, or 
sponsored by Amazon.
Amazon API Gateway
Developer Guide
Table of Contents
What is Amazon API Gateway? ....................................................................................................... 1
Architecture of API Gateway ...................................................................................................................... 2
Features of API Gateway ............................................................................................................................. 2
API Gateway use cases ................................................................................................................................ 3
Use API Gateway to create REST APIs ................................................................................................ 3
Use API Gateway to create HTTP APIs ............................................................................................... 4
Use API Gateway to create WebSocket APIs ..................................................................................... 5
Who uses API Gateway? ........................................................................................................................ 5

API Gateway use cases ................................................................................................................................ 3
Use API Gateway to create REST APIs ................................................................................................ 3
Use API Gateway to create HTTP APIs ............................................................................................... 4
Use API Gateway to create WebSocket APIs ..................................................................................... 5
Who uses API Gateway? ........................................................................................................................ 5
Accessing API Gateway ................................................................................................................................ 6
Part of AWS serverless infrastructure ...................................................................................................... 7
How to get started with Amazon API Gateway ..................................................................................... 7
API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14

API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14
API management .................................................................................................................................. 15
Development .......................................................................................................................................... 15
Monitoring .............................................................................................................................................. 16
Integrations ............................................................................................................................................ 17
Get started with the REST API console ................................................................................................. 17
Step 1: Create a Lambda function .................................................................................................... 18
Step 2: Create a REST API .................................................................................................................. 19
Step 3: Create a Lambda proxy integration .................................................................................... 19

as %2F instead of /. This template translates the %2F into '/' before passing it to the Lambda 
function.
To create a mapping template
On the Integration request tab, under Integration request settings, choose Edit.
For Request body passthrough, select When there are no templates deﬁned 
(recommended).
Choose Mapping templates.
For Content type, enter application/json.
For Template body, enter the following code:
{ 
   "a": "$input.params('operand1')", 
   "b": "$input.params('operand2')", 
   "op": 
 #if($input.params('operator')=='%2F')"/"#{else}"$input.params('operator')"#end
}
Choose Save.
Tutorial: Create a calculator REST API with three integrations
Amazon API Gateway
Developer Guide
You can now test your GET method to verify that it has been properly set up to invoke the Lambda 
function and pass the original output through the integration response without mapping.
To test the GET method
Choose the Test tab. You might need to choose the right arrow button to show the tab.
For the Path, do the following:
a.
For operand1, enter 1.
b.
For operand2, enter 1.
c.
For operator, enter +.
Choose Test.
The result should look like this:
Next, you model the data structure of the method response payload after the result schema.
By default, the method response body is assigned an empty model. This will cause the integration 
response body to be passed through without mapping. However, when you generate an SDK for 
one of the strongly-type languages, such as Java or Objective-C, your SDK users will receive an 
empty object as the result. To ensure that both the REST client and SDK clients receive the desired 
result, you must model the response data using a predeﬁned schema. Here you'll deﬁne a model 
for the method response body and to construct a mapping template to translate the integration 
response body into the method response body.
To create a method response
On the Method response tab, under Response 200, choose Edit.
Under Response body, choose Add model.

}, 
        { 
            "Effect": "Allow", 
            "Action": [ 
                "logs:CreateLogStream", 
                "logs:PutLogEvents" 
            ], 
            "Resource": [ 
                "arn:aws:logs:us-east-1:111111111111:log-group:/aws/lambda/
GetStartedLambdaIntegration:*" 
            ] 
        } 
    ]
}
The other policy document applies to invoking another AWS service that is not used in this 
example. You can skip it for now.
Associated with the IAM role is a trusted entity, which is lambda.amazonaws.com. Here is the 
trust relationship:
JSON
{ 
  "Version":"2012-10-17",        
  "Statement": [ 
    { 
      "Effect": "Allow", 
Choose a Lambda integration tutorial
Amazon API Gateway
Developer Guide
      "Principal": { 
        "Service": "lambda.amazonaws.com" 
      }, 
      "Action": "sts:AssumeRole" 
    } 
  ]
}
The combination of this trust relationship and the inline policy makes it possible for the Lambda 
function to invoke a console.log() function to log events to CloudWatch Logs.
Create an API with Lambda non-proxy integration
With the Lambda function (GetStartedLambdaIntegration) created and tested, you are ready 
to expose the function through an API Gateway API. For illustration purposes, we expose the 
Lambda function with a generic HTTP method. We use the request body, a URL path variable, 
a query string, and a header to receive required input data from the client. We turn on the API 
Gateway request validator for the API to ensure that all of the required data is properly deﬁned 
and speciﬁed. We conﬁgure a mapping template for API Gateway to transform the client-supplied 
request data into the valid format as required by the backend Lambda function.
To create an API with a Lambda non-proxy integration
Sign in to the API Gateway console at 
If this is your ﬁrst time using API Gateway, you see a page that introduces you to the features
`

**Generated Answer (Response):**
> 

The provided context does not mention a specific Condition clause in the Allow policy related to the ARN of the API's GET method. The policy documents shown are related to logging and assuming an IAM role for a Lambda function, but they do not mention the API's GET method or its ARN.

However, in general, when creating a Lambda function with an API Gateway REST API, the generated policy might include a Condition clause that restricts the execution of the Lambda function to a specific API and method. For example, the Condition clause might look like this:
```
"Condition": {
  "ArnLike": {
    "aws:SourceArn": "arn:aws:execute-api:us-east-1:123456789012:restapi/{rest-api-id}/GET/pets"
  }
}
```
This Condition clause restricts the execution of the Lambda function to the specific GET method of the PetStore API with the ID `{rest-api-id}`. The `aws:SourceArn` key specifies the ARN of the API and method that is allowed to invoke the Lambda function.

Note that the provided context does not mention the PetStore example API or its integration with an HTTP backend website, so it's unclear how this relates to the specific question.

**Scores:** Faithfulness: 1 | Relevance: 0 | Context Accuracy: 1

---

## Question 20
**Query:** What is the recommended approach to automate the creation and cleanup of AWS resources, such as Lambda functions and their associated log groups and execution roles, in a scenario where you need to repeatedly create and delete these resources as part of a CI/CD pipeline, and how would you implement this approach using CloudFormation or AWS SAM?

**Ground Truth:**
> The recommended approach is to use CloudFormation or AWS SAM to automate the creation and cleanup of AWS resources. You can create a CloudFormation template or an AWS SAM template that defines the resources required for your application, including the Lambda function, log group, and execution role. Then, you can use the AWS CLI or SDKs to create and delete the stack as needed, which will automatically create and delete the associated resources. This approach allows you to version control your infrastructure and manage it as code, making it easier to reproduce and manage your application's infrastructure across different environments.

**Retrieved Context (Proof):**
`	ext
Developer Guide
Amazon API Gateway
Copyright © 2026 Amazon Web Services, Inc. and/or its aﬃliates. All rights reserved.
Amazon API Gateway
Developer Guide
Amazon API Gateway: Developer Guide
Copyright © 2026 Amazon Web Services, Inc. and/or its aﬃliates. All rights reserved.
Amazon's trademarks and trade dress may not be used in connection with any product or service 
that is not Amazon's, in any manner that is likely to cause confusion among customers, or in any 
manner that disparages or discredits Amazon. All other trademarks not owned by Amazon are 
the property of their respective owners, who may or may not be aﬃliated with, connected to, or 
sponsored by Amazon.
Amazon API Gateway
Developer Guide
Table of Contents
What is Amazon API Gateway? ....................................................................................................... 1
Architecture of API Gateway ...................................................................................................................... 2
Features of API Gateway ............................................................................................................................. 2
API Gateway use cases ................................................................................................................................ 3
Use API Gateway to create REST APIs ................................................................................................ 3
Use API Gateway to create HTTP APIs ............................................................................................... 4
Use API Gateway to create WebSocket APIs ..................................................................................... 5
Who uses API Gateway? ........................................................................................................................ 5

API Gateway use cases ................................................................................................................................ 3
Use API Gateway to create REST APIs ................................................................................................ 3
Use API Gateway to create HTTP APIs ............................................................................................... 4
Use API Gateway to create WebSocket APIs ..................................................................................... 5
Who uses API Gateway? ........................................................................................................................ 5
Accessing API Gateway ................................................................................................................................ 6
Part of AWS serverless infrastructure ...................................................................................................... 7
How to get started with Amazon API Gateway ..................................................................................... 7
API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14

API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14
API management .................................................................................................................................. 15
Development .......................................................................................................................................... 15
Monitoring .............................................................................................................................................. 16
Integrations ............................................................................................................................................ 17
Get started with the REST API console ................................................................................................. 17
Step 1: Create a Lambda function .................................................................................................... 18
Step 2: Create a REST API .................................................................................................................. 19
Step 3: Create a Lambda proxy integration .................................................................................... 19

created. In subsequent sections, you'll add resources and methods to it.
Tutorial: Create a calculator REST API with three integrations
Amazon API Gateway
Developer Guide
To create an API
Sign in to the API Gateway console at 
If this is your ﬁrst time using API Gateway, you see a page that introduces you to the features 
of the service. Under REST API, choose Build. When the Create Example API popup appears, 
choose OK.
If this is not your ﬁrst time using API Gateway, choose Create API. Under REST API, choose
Build.
For API name, enter LambdaCalc.
(Optional) For Description, enter a description.
Keep API endpoint type set to Regional.
For IP address type, select IPv4.
Choose Create API.
Integration 1: Create a GET method with query parameters to call the Lambda 
function
By creating a GET method that passes query string parameters to the Lambda function, you enable 
the API to be invoked from a browser. This approach can be useful, especially for APIs that allow 
open access.
After you create an API, you create a resource. Typically, API resources are organized in a resource 
tree according to the application logic. For this step, you create a /calc resource.
To create a /calc resource
Choose Create resource.
Keep Proxy resource turned oﬀ.
Keep Resource path as /.
For Resource name, enter calc.
Keep CORS (Cross Origin Resource Sharing) turned oﬀ.
Choose Create resource.
Tutorial: Create a calculator REST API with three integrations
Amazon API Gateway
Developer Guide
By creating a GET method that passes query string parameters to the Lambda function, you enable 
the API to be invoked from a browser. This approach can be useful, especially for APIs that allow 
open access.
In this method, Lambda requires that the POST request be used to invoke any Lambda function. 
This example shows that the HTTP method in a frontend method request can be diﬀerent from the 
integration request in the backend.
To create a GET method

Choose a Lambda integration tutorial
Amazon API Gateway
Developer Guide
To test the API using cURL
Open a terminal window on your local computer connected to the internet.
To test POST /Seattle?time=evening:
Copy the following cURL command and paste it into the terminal window.
curl -v -X POST \ 
  '
time=evening' \ 
  -H 'content-type: application/json' \ 
  -H 'day: Thursday' \ 
  -H 'x-amz-docs-region: us-west-2' \ 
  -d '{ 
 "callerName": "John"
}'
You should get a successful response with the following payload:
{"greeting":"Good evening, John of Seattle. Happy Thursday!"}
If you change POST to PUT in this method request, you get the same response.
Clean up
If you no longer need the Lambda functions you created for this walkthrough, you can delete them 
now. You can also delete the accompanying IAM resources.
Warning
If you plan to complete the other walkthroughs in this series, do not delete the Lambda 
execution role or the Lambda invocation role. If you delete a Lambda function that your 
APIs rely on, those APIs will no longer work. Deleting a Lambda function cannot be undone. 
If you want to use the Lambda function again, you must re-create the function.
If you delete an IAM resource that a Lambda function relies on, that Lambda function will 
no longer work, and any APIs that rely on that function will no longer work. Deleting an 
IAM resource cannot be undone. If you want to use the IAM resource again, you must re-
create the resource.
Choose a Lambda integration tutorial
Amazon API Gateway
Developer Guide
To delete the Lambda function
Sign in to the AWS Management Console and open the AWS Lambda console at https:// 
console.aws.amazon.com/lambda/.
From the list of functions, choose GetStartedLambdaIntegration, choose Actions, and then 
choose Delete function. When prompted, choose Delete again.
To delete the associated IAM resources
Open the IAM console at 
From Details, choose Roles.
`

**Generated Answer (Response):**
> 

The recommended approach to automate the creation and cleanup of AWS resources, such as Lambda functions and their associated log groups and execution roles, in a scenario where you need to repeatedly create and delete these resources as part of a CI/CD pipeline is to use Infrastructure as Code (IaC) tools like AWS CloudFormation or AWS SAM.

With CloudFormation or SAM, you can define your infrastructure resources in a template file, which can be version-controlled and reused across different environments. This approach allows you to:

1. Define your resources in a declarative way, specifying what resources you want to create and how they should be configured.
2. Create and manage resources consistently across different environments, such as dev, staging, and prod.
3. Easily roll back changes or delete resources when they are no longer needed.
4. Integrate with your CI/CD pipeline to automate the creation and cleanup of resources.

To implement this approach using CloudFormation or SAM, you would:

1. Create a template file (e.g., YAML or JSON) that defines the resources you want to create, such as Lambda functions, log groups, and execution roles.
2. Use the AWS CLI or SDKs to create a CloudFormation stack or SAM application from the template file.
3. Configure your CI/CD pipeline to deploy the CloudFormation stack or SAM application to the desired environment.
4. Use the AWS CLI or SDKs to delete the CloudFormation stack or SAM application when the resources are no longer needed.

For example, with CloudFormation, you could create a template file like this:
```yaml
AWSTemplateFormatVersion: '2010-09-09'

Resources:
  LambdaFunction:
    Type: 'AWS::Lambda::Function'
    Properties:
      FunctionName: !Sub 'my-lambda-function-${Environment}'
      Runtime: nodejs14.x
      Handler: index.handler
      Role: !GetAtt 'LambdaExecutionRole.Arn'

  LambdaExecutionRole:
    Type: 'AWS::IAM::Role'
    Properties:
      AssumeRolePolicyDocument:
        Version: '2012-10-17'
        Statement:
          - Effect: 'Allow'
            Principal:
              Service: lambda.amazonaws.com
            Action: 'sts:AssumeRole'
      Policies:
        - PolicyName: execution-role-policy
          PolicyDocument:
            Version: '2012-10-17'
            Statement:
              - Effect: 'Allow'
                Action:
                  - 'logs:CreateLogGroup'
                  - 'logs:CreateLogStream'
                  - 'logs:PutLogEvents'
                Resource: !Sub 'arn:aws:logs:${AWS::Region}:${AWS::AccountId}:log-group:/aws/lambda/${LambdaFunction}'

  LogGroup:
    Type: 'AWS::CloudWatch::LogGroup'
    Properties:
      LogGroupName: !Sub '/aws/lambda/${LambdaFunction}'
```
This template defines a Lambda function, an execution role, and a log group. You can then use the AWS CLI to create a CloudFormation stack from this template file and deploy it to your desired environment.

Similarly, with SAM, you could create a template file like this:
```yaml
AWSTemplateFormatVersion: '2010-09-09'

Resources:
  MyFunction:
    Type: AWS::Serverless::Function
    Properties:
      FunctionName: !Sub 'my-lambda-function-${Environment}'
      Runtime: nodejs14.x
      Handler: index.handler
      Role: !GetAtt 'MyFunctionRole.Arn'

  MyFunctionRole:
    Type: AWS::IAM::Role
    Properties:
      AssumeRolePolicyDocument:
        Version: '2012-10-17'
        Statement:
          - Effect: 'Allow'
            Principal:
              Service: lambda.amazonaws.com
            Action: 'sts:AssumeRole'
      Policies:
        - PolicyName: execution-role-policy
          PolicyDocument:
            Version: '2012-10-17'
            Statement:
              - Effect: 'Allow'
                Action:
                  - 'logs:CreateLogGroup'
                  - 'logs:CreateLogStream'
                  - 'logs:PutLogEvents'
                Resource: !Sub 'arn:aws:logs:${AWS::Region}:${AWS::AccountId}:log-group:/aws/lambda/${MyFunction}'

  MyLogGroup:
    Type: AWS::CloudWatch::LogGroup
    Properties:
      LogGroupName: !Sub '/aws/lambda/${MyFunction}'
```
This template defines a Lambda function, an execution role, and a log group using SAM syntax. You can then use the SAM CLI to deploy this template file to your desired environment.

By using CloudFormation or SAM, you can automate the creation and cleanup of AWS resources, such as Lambda functions and their associated log groups and execution roles, in a consistent and repeatable way, making it easier to manage your infrastructure as part of your CI/CD pipeline.

**Scores:** Faithfulness: 0 | Relevance: 1 | Context Accuracy: 0

---

## Question 21
**Query:** What is the minimum number of AWS services that must be integrated with API Gateway to create a REST API that performs CRUD operations, uses a WebSocket chat app, and leverages serverless identity management, authentication, and authorization, assuming you have already completed the 'Tutorial: Create a REST API with a Lambda proxy integration' and have a basic understanding of AWS SDKs and the AWS CLI?

**Ground Truth:**
> At least 5 AWS services (API Gateway, Lambda, DynamoDB, Amazon ECS, and Amazon S3 or Amazon Kinesis) must be integrated to meet the specified requirements.

**Retrieved Context (Proof):**
`	ext
Developer Guide
Amazon API Gateway
Copyright © 2026 Amazon Web Services, Inc. and/or its aﬃliates. All rights reserved.
Amazon API Gateway
Developer Guide
Amazon API Gateway: Developer Guide
Copyright © 2026 Amazon Web Services, Inc. and/or its aﬃliates. All rights reserved.
Amazon's trademarks and trade dress may not be used in connection with any product or service 
that is not Amazon's, in any manner that is likely to cause confusion among customers, or in any 
manner that disparages or discredits Amazon. All other trademarks not owned by Amazon are 
the property of their respective owners, who may or may not be aﬃliated with, connected to, or 
sponsored by Amazon.
Amazon API Gateway
Developer Guide
Table of Contents
What is Amazon API Gateway? ....................................................................................................... 1
Architecture of API Gateway ...................................................................................................................... 2
Features of API Gateway ............................................................................................................................. 2
API Gateway use cases ................................................................................................................................ 3
Use API Gateway to create REST APIs ................................................................................................ 3
Use API Gateway to create HTTP APIs ............................................................................................... 4
Use API Gateway to create WebSocket APIs ..................................................................................... 5
Who uses API Gateway? ........................................................................................................................ 5

API Gateway use cases ................................................................................................................................ 3
Use API Gateway to create REST APIs ................................................................................................ 3
Use API Gateway to create HTTP APIs ............................................................................................... 4
Use API Gateway to create WebSocket APIs ..................................................................................... 5
Who uses API Gateway? ........................................................................................................................ 5
Accessing API Gateway ................................................................................................................................ 6
Part of AWS serverless infrastructure ...................................................................................................... 7
How to get started with Amazon API Gateway ..................................................................................... 7
API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14

API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14
API management .................................................................................................................................. 15
Development .......................................................................................................................................... 15
Monitoring .............................................................................................................................................. 16
Integrations ............................................................................................................................................ 17
Get started with the REST API console ................................................................................................. 17
Step 1: Create a Lambda function .................................................................................................... 18
Step 2: Create a REST API .................................................................................................................. 19
Step 3: Create a Lambda proxy integration .................................................................................... 19

For more information about API Gateway WebSocket APIs, see the section called “Use API Gateway 
to create WebSocket APIs” and the section called “Overview of WebSocket APIs”.
Topics
• Architecture of API Gateway
• Features of API Gateway
• API Gateway use cases
• Accessing API Gateway
• Part of AWS serverless infrastructure
• How to get started with Amazon API Gateway
Amazon API Gateway
Developer Guide
• Amazon API Gateway concepts
• Choose between REST APIs and HTTP APIs
• Get started with the REST API console
Architecture of API Gateway
The following diagram shows API Gateway architecture.
This diagram illustrates how the APIs you build in Amazon API Gateway provide you or your 
developer customers with an integrated and consistent developer experience for building AWS 
serverless applications. API Gateway handles all the tasks involved in accepting and processing 
up to hundreds of thousands of concurrent API calls. These tasks include traﬃc management, 
authorization and access control, monitoring, and API version management.
API Gateway acts as a "front door" for applications to access data, business logic, or functionality 
from your backend services, such as workloads running on Amazon Elastic Compute Cloud 
(Amazon EC2), code running on AWS Lambda, any web application, or real-time communication 
applications.
Features of API Gateway
Amazon API Gateway oﬀers features such as the following:
Architecture of API Gateway
Amazon API Gateway
Developer Guide
• Support for stateful (WebSocket) and stateless (HTTP and REST) APIs.
• Powerful, ﬂexible authentication mechanisms, such as AWS Identity and Access Management 
policies, Lambda authorizer functions, and Amazon Cognito user pools.
• Canary release deployments for safely rolling out changes.
• CloudTrail logging and monitoring of API usage and API changes.
• CloudWatch access logging and execution logging, including the ability to set alarms. For more

To learn more, see the section called “Choose between REST APIs and HTTP APIs ”.
Use API Gateway to create WebSocket APIs
In a WebSocket API, the client and the server can both send messages to each other at any 
time. Backend servers can easily push data to connected users and devices, avoiding the need to 
implement complex polling mechanisms.
For example, you could build a serverless application using an API Gateway WebSocket API and 
AWS Lambda to send and receive messages to and from individual users or groups of users in a 
chat room. Or you could invoke backend services such as AWS Lambda, Amazon Kinesis, or an HTTP 
endpoint based on message content.
You can use API Gateway WebSocket APIs to build secure, real-time communication applications 
without having to provision or manage any servers to manage connections or large-scale data 
exchanges. Targeted use cases include real-time applications such as the following:
• Chat applications
• Real-time dashboards such as stock tickers
• Real-time alerts and notiﬁcations
API Gateway provides WebSocket API management functionality such as the following:
• Monitoring and throttling of connections and messages
• Using AWS X-Ray to trace messages as they travel through the APIs to backend services
• Easy integration with HTTP/HTTPS endpoints
Who uses API Gateway?
There are two kinds of developers who use API Gateway: API developers and app developers.
An API developer creates and deploys an API to enable the required functionality in API Gateway. 
The API developer must be a user in the AWS account that owns the API.
An app developer builds a functioning application to call AWS services by invoking a WebSocket or 
REST API created by an API developer in API Gateway.
Use API Gateway to create WebSocket APIs
Amazon API Gateway
Developer Guide
The app developer is the customer of the API developer. The app developer doesn't need to
`

**Generated Answer (Response):**
> 

Based on the provided context, to create a REST API that performs CRUD operations, uses a WebSocket chat app, and leverages serverless identity management, authentication, and authorization, you would need to integrate the following AWS services with API Gateway:

1. AWS Lambda (for CRUD operations and WebSocket chat app)
2. Amazon Cognito (for serverless identity management, authentication, and authorization)

Since you have already completed the 'Tutorial: Create a REST API with a Lambda proxy integration', you have already integrated API Gateway with AWS Lambda.

Therefore, the minimum number of additional AWS services that must be integrated with API Gateway is 1, which is Amazon Cognito.

**Scores:** Faithfulness: 1 | Relevance: 1 | Context Accuracy: 1

---

## Question 22
**Query:** What is the primary difference in the way the 'greeter' variable is populated in the Node.js and Python Lambda function handlers when the 'greeter' value is passed as a multi-value header, and how does this impact the resulting 'Hello' response?

**Ground Truth:**
> In the Node.js handler, the 'greeter' variable is populated by joining the array of values in the 'multiValueHeaders.greeter' object with ' and ', whereas in the Python handler, the 'greeter' variable is populated by joining the list of values in the 'event.multiValueHeaders.greeter' dictionary with ' and '. This difference in handling multi-value headers can result in different 'Hello' responses, with the Node.js handler producing a response like 'Hello, John and Jane!' and the Python handler producing a response like 'Hello, John and Jane and Bob!' if multiple values are passed in the 'greeter' header.

**Retrieved Context (Proof):**
`	ext
Integrations ............................................................................................................................................ 17
Get started with the REST API console ................................................................................................. 17
Step 1: Create a Lambda function .................................................................................................... 18
Step 2: Create a REST API .................................................................................................................. 19
Step 3: Create a Lambda proxy integration .................................................................................... 19
Step 4: Deploy your API ...................................................................................................................... 20
Step 5: Invoke your API ....................................................................................................................... 20
(Optional) Step 6: Clean up ................................................................................................................ 21
Prerequisites .................................................................................................................................. 23
Sign up for an AWS account ................................................................................................................... 23
Get started ..................................................................................................................................... 24
Step 1: Create a Lambda function ......................................................................................................... 25
Step 2: Create an HTTP API ..................................................................................................................... 25

API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14
API management .................................................................................................................................. 15
Development .......................................................................................................................................... 15
Monitoring .............................................................................................................................................. 16
Integrations ............................................................................................................................................ 17
Get started with the REST API console ................................................................................................. 17
Step 1: Create a Lambda function .................................................................................................... 18
Step 2: Create a REST API .................................................................................................................. 19
Step 3: Create a Lambda proxy integration .................................................................................... 19

Prerequisites .................................................................................................................................. 23
Sign up for an AWS account ................................................................................................................... 23
Get started ..................................................................................................................................... 24
Step 1: Create a Lambda function ......................................................................................................... 25
Step 2: Create an HTTP API ..................................................................................................................... 25
Step 3: Test your API ................................................................................................................................ 26
(Optional) Step 4: Clean up ..................................................................................................................... 27
iii
Amazon API Gateway
Developer Guide
Next steps .................................................................................................................................................... 28
Tutorials and workshops ............................................................................................................... 30
REST API tutorials ...................................................................................................................................... 31
Choose a Lambda integration tutorial ............................................................................................. 31
Tutorial: Create a REST API by importing an example .................................................................. 55
Choose an HTTP integration tutorial ............................................................................................... 65

c.
To call the API with a body of {"greeter":"John"}:
curl -X POST 
helloworld \ 
  -H 'content-type: application/json' \ 
  -d '{ "greeter": "John" }'
In all the cases, the output is a 200 response with the following response body:
Hello, John!
Tutorial: Create a REST API with a Lambda non-proxy integration
In this walkthrough, we use the API Gateway console to build an API that enables a client to call 
Lambda functions through the Lambda non-proxy integration (also known as custom integration). 
For more information about AWS Lambda and Lambda functions, see the AWS Lambda Developer 
Guide.
To facilitate learning, we chose a simple Lambda function with minimal API setup to walk you 
through the steps of building an API Gateway API with the Lambda custom integration. When 
Choose a Lambda integration tutorial
Amazon API Gateway
Developer Guide
necessary, we describe some of the logic. For a more detailed example of the Lambda custom 
integration, see Tutorial: Create a calculator REST API with two AWS service integrations and one 
Lambda non-proxy integration.
Before creating the API, set up the Lambda backend by creating a Lambda function in AWS 
Lambda, described next.
Topics
• Create a Lambda function for Lambda non-proxy integration
• Create an API with Lambda non-proxy integration
• Test invoking the API method
• Deploy the API
• Test the API in a deployment stage
• Clean up
Create a Lambda function for Lambda non-proxy integration
Note
Creating Lambda functions may result in charges to your AWS account.
In this step, you create a "Hello, World!"-like Lambda function for the Lambda custom integration. 
Throughout this walkthrough, the function is called GetStartedLambdaIntegration.
The implementation of this GetStartedLambdaIntegration Lambda function is as follows:
Node.js
'use strict';
var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 
 'Saturday'];             
var times = ['morning', 'afternoon', 'evening', 'night', 'day'];

let time = times.indexOf(event.time) Functions list page appears, choose Create function.
Choose Author from scratch.
In the Author from scratch pane, do the following:
a.
For Name, enter GetStartedLambdaIntegration as the Lambda function name.
b.
For Runtime, choose either the latest supported Node.js or Python runtime.
c.
For Architecture, keep the default setting.
d.
Under Permissions, expand Change default execution role. For Execution role dropdown 
list, choose Create new role from AWS policy templates.
Choose a Lambda integration tutorial
Amazon API Gateway
Developer Guide
e.
For Role name, enter a name for your role (for example,
GetStartedLambdaIntegrationRole).
f.
For Policy templates, choose Simple microservice permissions.
g.
Choose Create function.
In the Conﬁgure function pane, under Function code do the following:
a.
Copy the Lambda function code listed in the beginning of this section and paste it in the 
inline code editor.
b.
Leave the default choices for all other ﬁelds in this section.
c.
Choose Deploy.
To test the newly created function, choose the Test tab.
a.
For Event name, enter HelloWorldTest.
b.
For Event JSON, replace the default code with the following.
{ 
  "name": "Jonny", 
  "city": "Seattle", 
  "time": "morning", 
  "day": "Wednesday"
}
c.
Choose Test to invoke the function. The Execution result: succeeded section is shown. 
Expand Details and you see the following output.
{ 
    "greeting": "Good morning, Jonny of Seattle. Happy Wednesday!"
}
The output is also written to CloudWatch Logs.
As a side exercise, you can use the IAM console to view the IAM role 
(GetStartedLambdaIntegrationRole) that was created as part of the Lambda function 
creation. Attached to this IAM role are two inline policies. One stipulates the most basic 
permissions for Lambda execution. It permits calling the CloudWatch CreateLogGroup
for any CloudWatch resources of your account in the region where the Lambda function is
`

**Generated Answer (Response):**
> 

There is no mention of a Python Lambda function handler in the provided context. The context only provides a Node.js Lambda function handler. Therefore, it is not possible to compare the way the 'greeter' variable is populated in Node.js and Python Lambda function handlers.

However, if you're asking about how the 'greeter' variable is populated in the Node.js Lambda function handler when the 'greeter' value is passed as a multi-value header, the answer is that the context does not provide information on how to handle multi-value headers. The provided Node.js Lambda function handler only handles the 'greeter' value as a JSON payload, not as a multi-value header.

In the provided example, the 'greeter' value is passed as a JSON payload in the request body, and it is accessed in the Lambda function handler using `event.greeter`. If the 'greeter' value were passed as a multi-value header, the Lambda function handler would need to be modified to access the header values, which is not shown in the provided context.

**Scores:** Faithfulness: 1 | Relevance: 1 | Context Accuracy: 1

---

## Question 23
**Query:** What is the primary purpose of configuring a mapping template for API Gateway in the context of a Lambda non-proxy integration, and how does it ensure that the required input data is properly defined and specified?

**Ground Truth:**
> The primary purpose of configuring a mapping template for API Gateway is to transform the client-supplied request data into a valid format as required by the backend Lambda function. This ensures that the required input data is properly defined and specified by allowing API Gateway to map the request body, URL path variable, query string, and header to the corresponding input parameters of the Lambda function, thereby guaranteeing that all required data is present and correctly formatted before invoking the Lambda function.

**Retrieved Context (Proof):**
`	ext
Developer Guide
Amazon API Gateway
Copyright © 2026 Amazon Web Services, Inc. and/or its aﬃliates. All rights reserved.
Amazon API Gateway
Developer Guide
Amazon API Gateway: Developer Guide
Copyright © 2026 Amazon Web Services, Inc. and/or its aﬃliates. All rights reserved.
Amazon's trademarks and trade dress may not be used in connection with any product or service 
that is not Amazon's, in any manner that is likely to cause confusion among customers, or in any 
manner that disparages or discredits Amazon. All other trademarks not owned by Amazon are 
the property of their respective owners, who may or may not be aﬃliated with, connected to, or 
sponsored by Amazon.
Amazon API Gateway
Developer Guide
Table of Contents
What is Amazon API Gateway? ....................................................................................................... 1
Architecture of API Gateway ...................................................................................................................... 2
Features of API Gateway ............................................................................................................................. 2
API Gateway use cases ................................................................................................................................ 3
Use API Gateway to create REST APIs ................................................................................................ 3
Use API Gateway to create HTTP APIs ............................................................................................... 4
Use API Gateway to create WebSocket APIs ..................................................................................... 5
Who uses API Gateway? ........................................................................................................................ 5

API Gateway use cases ................................................................................................................................ 3
Use API Gateway to create REST APIs ................................................................................................ 3
Use API Gateway to create HTTP APIs ............................................................................................... 4
Use API Gateway to create WebSocket APIs ..................................................................................... 5
Who uses API Gateway? ........................................................................................................................ 5
Accessing API Gateway ................................................................................................................................ 6
Part of AWS serverless infrastructure ...................................................................................................... 7
How to get started with Amazon API Gateway ..................................................................................... 7
API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14

API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14
API management .................................................................................................................................. 15
Development .......................................................................................................................................... 15
Monitoring .............................................................................................................................................. 16
Integrations ............................................................................................................................................ 17
Get started with the REST API console ................................................................................................. 17
Step 1: Create a Lambda function .................................................................................................... 18
Step 2: Create a REST API .................................................................................................................. 19
Step 3: Create a Lambda proxy integration .................................................................................... 19

following step.
13. Choose Add query string.
14. For Name, enter shard-id.
15. Keep Required and Caching turned oﬀ.
Tutorial: Create a REST API as an Amazon Kinesis proxy
Amazon API Gateway
Developer Guide
16. Choose Create method.
17. In the Integration request section, add the following mapping template to generate the 
required input (ShardId and StreamName) to the GetShardIterator action from the
shard-id and stream-name parameters of the method request. In addition, the mapping 
template also sets ShardIteratorType to TRIM_HORIZON as a default.
{ 
    "ShardId": "$input.params('shard-id')", 
    "ShardIteratorType": "TRIM_HORIZON", 
    "StreamName": "$input.params('stream-name')"
}
18. Using the Test option in the API Gateway console, enter an existing stream name as the
stream-name Path variable value, set the shard-id Query string to an existing ShardId
value (e.g., shard-000000000004), and choose Test.
The successful response payload is similar to the following output:
{ 
  "ShardIterator": "AAAAAAAAAAFYVN3VlFy..."
}
Make note of the ShardIterator value. You need it to get records from a stream.
To conﬁgure and test the GET /streams/{stream-name}/records method to invoke the
GetRecords action in Kinesis
Choose the /records resource, and then choose Create method.
For Method type, select GET.
For Integration type, select AWS service.
For AWS Region, select the AWS Region where you created your Kinesis stream.
For AWS service, select Kinesis.
Keep AWS subdomain blank.
For HTTP method, choose POST.
For Action type, choose Use action name.
For Action name, enter GetRecords.
Tutorial: Create a REST API as an Amazon Kinesis proxy
Amazon API Gateway
Developer Guide
10. For Execution role, enter the ARN for your execution role.
11. Keep the default of Passthrough for Content Handling.
12. Choose HTTP request headers.
The GetRecords action requires an input of a ShardIterator value. To pass a client-

Invoke action to execute our Calc function.
For Path override, enter 2015-03-31/functions/arn:aws:lambda:us-
east-2:account-id:function:Calc/invocations. For  account-id, enter your AWS 
account ID. For us-east-2, enter the AWS Region where you created your Lambda function.
10. For Execution role, enter the role ARN for
lambda_invoke_function_assume_apigw_role.
11. Do not change the settings of Credential cache and Default timeout.
12. Choose Method request settings.
13. For Request validator, select Validate query string parameters and headers.
This setting will cause an error message to return if the client does not specify the required 
parameters.
14. Choose URL query string parameters.
Now you set up query string parameters for the GET method on the /calc resource so it can 
receive input on behalf of the backend Lambda function.
To create the query string parameters do the following:
Tutorial: Create a calculator REST API with three integrations
Amazon API Gateway
Developer Guide
a.
Choose Add query string.
b.
For Name, enter operand1.
c.
Turn on Required.
d.
Keep Caching turned oﬀ.
Repeat the same steps and create a query string named operand2 and a query string named
operator.
15. Choose Create method.
Now, you create a mapping template to translate the client-supplied query strings to the 
integration request payload as required by the Calc function. This template maps the three query 
string parameters declared in Method request into designated property values of the JSON object 
as the input to the backend Lambda function. The transformed JSON object will be included as the 
integration request payload.
To map input parameters to the integration request
On the Integration request tab, under Integration request settings, choose Edit.
For Request body passthrough, select When there are no templates deﬁned 
(recommended).
Choose Mapping templates.
Choose Add mapping template.
For Content type, enter application/json.
`

**Generated Answer (Response):**
> 

In the context of a Lambda non-proxy integration, the primary purpose of configuring a mapping template for API Gateway is to translate the client-supplied input data into the required format expected by the Lambda function. This is done by defining a mapping between the API Gateway request parameters (such as query strings, headers, or body) and the input parameters required by the Lambda function.

The mapping template ensures that the required input data is properly defined and specified by:

1. Extracting the required input data from the API Gateway request parameters (e.g., query strings, headers, or body).
2. Transforming the extracted data into the format expected by the Lambda function.
3. Including the transformed data as part of the integration request payload sent to the Lambda function.

By configuring a mapping template, you can ensure that the Lambda function receives the correct input data in the expected format, which is essential for the function to process the request correctly.

**Scores:** Faithfulness: 1 | Relevance: 1 | Context Accuracy: 1

---

## Question 24
**Query:** What is the primary difference between using a JWT authorizer versus a Lambda integration in an API Gateway WebSocket API, and how would you implement each in a scenario where you need to authenticate and authorize connected client apps while also sending real-time data to them?

**Ground Truth:**
> The primary difference is that a JWT authorizer is used for authentication and authorization of incoming requests, whereas a Lambda integration is used to integrate with a backend service to process requests. To implement each, you would use a JWT authorizer to validate the authentication token sent by the client app, and then use a Lambda integration to process the authorized request and send real-time data back to the client app using the WebSocket API.

**Retrieved Context (Proof):**
`	ext
Developer Guide
Amazon API Gateway
Copyright © 2026 Amazon Web Services, Inc. and/or its aﬃliates. All rights reserved.
Amazon API Gateway
Developer Guide
Amazon API Gateway: Developer Guide
Copyright © 2026 Amazon Web Services, Inc. and/or its aﬃliates. All rights reserved.
Amazon's trademarks and trade dress may not be used in connection with any product or service 
that is not Amazon's, in any manner that is likely to cause confusion among customers, or in any 
manner that disparages or discredits Amazon. All other trademarks not owned by Amazon are 
the property of their respective owners, who may or may not be aﬃliated with, connected to, or 
sponsored by Amazon.
Amazon API Gateway
Developer Guide
Table of Contents
What is Amazon API Gateway? ....................................................................................................... 1
Architecture of API Gateway ...................................................................................................................... 2
Features of API Gateway ............................................................................................................................. 2
API Gateway use cases ................................................................................................................................ 3
Use API Gateway to create REST APIs ................................................................................................ 3
Use API Gateway to create HTTP APIs ............................................................................................... 4
Use API Gateway to create WebSocket APIs ..................................................................................... 5
Who uses API Gateway? ........................................................................................................................ 5

API Gateway use cases ................................................................................................................................ 3
Use API Gateway to create REST APIs ................................................................................................ 3
Use API Gateway to create HTTP APIs ............................................................................................... 4
Use API Gateway to create WebSocket APIs ..................................................................................... 5
Who uses API Gateway? ........................................................................................................................ 5
Accessing API Gateway ................................................................................................................................ 6
Part of AWS serverless infrastructure ...................................................................................................... 7
How to get started with Amazon API Gateway ..................................................................................... 7
API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14

API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14
API management .................................................................................................................................. 15
Development .......................................................................................................................................... 15
Monitoring .............................................................................................................................................. 16
Integrations ............................................................................................................................................ 17
Get started with the REST API console ................................................................................................. 17
Step 1: Create a Lambda function .................................................................................................... 18
Step 2: Create a REST API .................................................................................................................. 19
Step 3: Create a Lambda proxy integration .................................................................................... 19

To create a Lambda function
Sign in to the Lambda console at 
Choose Create function.
For Function name, enter my-function.
For all other options, use the default setting.
Choose Create function.
The example function returns a 200 response to clients, and the text Hello from Lambda!.
You can modify your Lambda function, as long as the function's response aligns with the format 
that API Gateway requires.
The default Lambda function code should look similar to the following:
export const handler = async (event) => { 
    const response = { 
        statusCode: 200, 
        body: JSON.stringify('Hello from Lambda!'), 
    }; 
    return response;
};
Step 2: Create an HTTP API
Next, you create an HTTP API. API Gateway also supports REST APIs and WebSocket APIs, but an 
HTTP API is the best choice for this exercise. REST APIs support more features than HTTP APIs, but 
we don't need those features for this exercise. HTTP APIs are designed with minimal features so 
Step 1: Create a Lambda function
Amazon API Gateway
Developer Guide
that they can be oﬀered at a lower price. WebSocket APIs maintain persistent connections with 
clients for full-duplex communication, which isn't required for this example.
The HTTP API provides an HTTP endpoint for your Lambda function. API Gateway routes requests 
to your Lambda function, and then returns the function's response to clients.
To create an HTTP API
Sign in to the API Gateway console at 
Do one of the following:
•
To create your ﬁrst API, for HTTP API, choose Build.
•
If you've created an API before, choose Create API, and then choose Build for HTTP API.
For Integrations, choose Add integration.
Choose Lambda.
For Lambda function, enter my-function.
For API name, enter my-http-api.
Choose Next.
Review the route that API Gateway creates for you, and then choose Next.
Review the stage that API Gateway creates for you, and then choose Next.
10. Choose Create.

Choose an AWS Lambda integration tutorial
To build an API with Lambda integrations, you can use Lambda proxy integration or Lambda non-
proxy integration.
In Lambda proxy integration, the input to the Lambda function can be expressed as any 
combination of request headers, path variables, query string parameters, body, and API 
conﬁguration data. You only need to choose a Lambda function. API Gateway conﬁgures the 
integration request and integration response for you. Once set up, your API method can evolve 
without modifying the existing settings. This is possible because the backend Lambda function 
parses the incoming request data and responds to the client.
In Lambda non-proxy integration, you must ensure that input to the Lambda function is supplied 
as the integration request payload. You must map any input data the client supplied as request 
REST API tutorials
Amazon API Gateway
Developer Guide
parameters into the proper integration request body. You might also need to translate the client-
supplied request body into a format recognized by the Lambda function.
In either a Lambda proxy or a Lambda non-proxy integration, you can use a Lambda function in a 
diﬀerent account from the account where you created your API.
Topics
• Tutorial: Create a REST API with a Lambda proxy integration
• Tutorial: Create a REST API with a Lambda non-proxy integration
• Tutorial: Create a REST API with a cross-account Lambda proxy integration
Tutorial: Create a REST API with a Lambda proxy integration
Lambda proxy integration is a lightweight, ﬂexible API Gateway API integration type that allows 
you to integrate an API method – or an entire API – with a Lambda function. The Lambda function 
can be written in any language that Lambda supports. Because it's a proxy integration, you can 
change the Lambda function implementation at any time without needing to redeploy your API.
In this tutorial, you do the following:
`

**Generated Answer (Response):**
> 

The primary difference between using a JWT authorizer versus a Lambda integration in an API Gateway WebSocket API is the way they handle authentication and authorization.

A JWT authorizer is a built-in authorizer in API Gateway that verifies the JSON Web Token (JWT) sent in the request and checks the token's claims against a set of expected values. If the token is valid, the authorizer returns an IAM policy that allows or denies access to the API. This approach is suitable when you need to authenticate and authorize clients based on a JWT token.

On the other hand, a Lambda integration allows you to write custom authentication and authorization logic using a Lambda function. This approach provides more flexibility and control over the authentication and authorization process. You can use a Lambda function to validate the client's credentials, check permissions, and return a custom response to the client.

In a scenario where you need to authenticate and authorize connected client apps while also sending real-time data to them, you can implement each approach as follows:

**JWT Authorizer:**

1. Clients send a JWT token in the WebSocket connection request.
2. API Gateway verifies the JWT token using the JWT authorizer.
3. If the token is valid, API Gateway returns an IAM policy that allows access to the API.
4. The WebSocket API routes the connection to a Lambda function that handles the real-time data processing.
5. The Lambda function can use the authenticated client identity to authorize access to specific data or features.

**Lambda Integration:**

1. Clients send a connection request to the WebSocket API.
2. API Gateway routes the request to a Lambda function that handles authentication and authorization.
3. The Lambda function verifies the client's credentials and checks permissions.
4. If the client is authenticated and authorized, the Lambda function returns a custom response to the client, including any necessary authentication tokens or session IDs.
5. The WebSocket API establishes a connection with the client, and the Lambda function handles the real-time data processing, using the authenticated client identity to authorize access to specific data or features.

In both approaches, you can use API Gateway's built-in support for WebSocket APIs to establish a persistent connection with clients and send real-time data to them. The choice between using a JWT authorizer and a Lambda integration depends on the specific requirements of your use case and the level of customization you need for authentication and authorization.

**Scores:** Faithfulness: 1 | Relevance: 1 | Context Accuracy: 1

---

## Question 25
**Query:** What is the primary difference between the Lambda non-proxy integration used in this tutorial and the Lambda proxy integration, and how would the API Gateway request and response processing differ between these two integration types?

**Ground Truth:**
> The primary difference between Lambda non-proxy integration and Lambda proxy integration is that in non-proxy integration, API Gateway maps the incoming request data to a JSON object and passes it to the Lambda function, whereas in proxy integration, API Gateway passes the entire request object to the Lambda function. In non-proxy integration, API Gateway also expects the Lambda function to return a response object with specific keys, whereas in proxy integration, the Lambda function can return any response object. As a result, in non-proxy integration, API Gateway performs more request and response processing, such as mapping and validation, whereas in proxy integration, the Lambda function has more control over the request and response processing.

**Retrieved Context (Proof):**
`	ext
Developer Guide
Amazon API Gateway
Copyright © 2026 Amazon Web Services, Inc. and/or its aﬃliates. All rights reserved.
Amazon API Gateway
Developer Guide
Amazon API Gateway: Developer Guide
Copyright © 2026 Amazon Web Services, Inc. and/or its aﬃliates. All rights reserved.
Amazon's trademarks and trade dress may not be used in connection with any product or service 
that is not Amazon's, in any manner that is likely to cause confusion among customers, or in any 
manner that disparages or discredits Amazon. All other trademarks not owned by Amazon are 
the property of their respective owners, who may or may not be aﬃliated with, connected to, or 
sponsored by Amazon.
Amazon API Gateway
Developer Guide
Table of Contents
What is Amazon API Gateway? ....................................................................................................... 1
Architecture of API Gateway ...................................................................................................................... 2
Features of API Gateway ............................................................................................................................. 2
API Gateway use cases ................................................................................................................................ 3
Use API Gateway to create REST APIs ................................................................................................ 3
Use API Gateway to create HTTP APIs ............................................................................................... 4
Use API Gateway to create WebSocket APIs ..................................................................................... 5
Who uses API Gateway? ........................................................................................................................ 5

API Gateway use cases ................................................................................................................................ 3
Use API Gateway to create REST APIs ................................................................................................ 3
Use API Gateway to create HTTP APIs ............................................................................................... 4
Use API Gateway to create WebSocket APIs ..................................................................................... 5
Who uses API Gateway? ........................................................................................................................ 5
Accessing API Gateway ................................................................................................................................ 6
Part of AWS serverless infrastructure ...................................................................................................... 7
How to get started with Amazon API Gateway ..................................................................................... 7
API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14

API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14
API management .................................................................................................................................. 15
Development .......................................................................................................................................... 15
Monitoring .............................................................................................................................................. 16
Integrations ............................................................................................................................................ 17
Get started with the REST API console ................................................................................................. 17
Step 1: Create a Lambda function .................................................................................................... 18
Step 2: Create a REST API .................................................................................................................. 19
Step 3: Create a Lambda proxy integration .................................................................................... 19

Choose an AWS Lambda integration tutorial
To build an API with Lambda integrations, you can use Lambda proxy integration or Lambda non-
proxy integration.
In Lambda proxy integration, the input to the Lambda function can be expressed as any 
combination of request headers, path variables, query string parameters, body, and API 
conﬁguration data. You only need to choose a Lambda function. API Gateway conﬁgures the 
integration request and integration response for you. Once set up, your API method can evolve 
without modifying the existing settings. This is possible because the backend Lambda function 
parses the incoming request data and responds to the client.
In Lambda non-proxy integration, you must ensure that input to the Lambda function is supplied 
as the integration request payload. You must map any input data the client supplied as request 
REST API tutorials
Amazon API Gateway
Developer Guide
parameters into the proper integration request body. You might also need to translate the client-
supplied request body into a format recognized by the Lambda function.
In either a Lambda proxy or a Lambda non-proxy integration, you can use a Lambda function in a 
diﬀerent account from the account where you created your API.
Topics
• Tutorial: Create a REST API with a Lambda proxy integration
• Tutorial: Create a REST API with a Lambda non-proxy integration
• Tutorial: Create a REST API with a cross-account Lambda proxy integration
Tutorial: Create a REST API with a Lambda proxy integration
Lambda proxy integration is a lightweight, ﬂexible API Gateway API integration type that allows 
you to integrate an API method – or an entire API – with a Lambda function. The Lambda function 
can be written in any language that Lambda supports. Because it's a proxy integration, you can 
change the Lambda function implementation at any time without needing to redeploy your API.
In this tutorial, you do the following:

to expose the function through an API Gateway API. For illustration purposes, we expose the 
Lambda function with a generic HTTP method. We use the request body, a URL path variable, 
a query string, and a header to receive required input data from the client. We turn on the API 
Gateway request validator for the API to ensure that all of the required data is properly deﬁned 
and speciﬁed. We conﬁgure a mapping template for API Gateway to transform the client-supplied 
request data into the valid format as required by the backend Lambda function.
To create an API with a Lambda non-proxy integration
Sign in to the API Gateway console at 
If this is your ﬁrst time using API Gateway, you see a page that introduces you to the features 
of the service. Under REST API, choose Build. When the Create Example API popup appears, 
choose OK.
If this is not your ﬁrst time using API Gateway, choose Create API. Under REST API, choose
Build.
For API name, enter LambdaNonProxyAPI.
(Optional) For Description, enter a description.
Keep API endpoint type set to Regional.
For IP address type, select IPv4.
Choose Create API.
Choose a Lambda integration tutorial
Amazon API Gateway
Developer Guide
After creating your API, you create a /{city} resource. This is an example of a resource with a path 
variable that takes an input from the client. Later, you map this path variable into the Lambda 
function input using a mapping template.
To create a resource
Choose Create resource.
Keep Proxy resource turned oﬀ.
Keep Resource path as /.
For Resource name, enter {city}.
Keep CORS (Cross Origin Resource Sharing) turned oﬀ.
Choose Create resource.
After creating your /{city} resource, you create an ANY method. The ANY HTTP verb is a 
placeholder for a valid HTTP method that a client submits at run time. This example shows that
ANY method can be used for Lambda custom integration as well as for Lambda proxy integration.
To create an ANY method
`

**Generated Answer (Response):**
> 

The primary difference between Lambda non-proxy integration and Lambda proxy integration is how the input to the Lambda function is handled and how the integration request and response are processed.

In Lambda non-proxy integration, you must ensure that the input to the Lambda function is supplied as the integration request payload. You must map any input data the client supplied as request parameters into the proper integration request body. You might also need to translate the client-supplied request body into a format recognized by the Lambda function.

In contrast, in Lambda proxy integration, the input to the Lambda function can be expressed as any combination of request headers, path variables, query string parameters, body, and API configuration data. You only need to choose a Lambda function, and API Gateway configures the integration request and integration response for you. This means that API Gateway handles the mapping of input data and translation of the request body, allowing for more flexibility and ease of use.

In terms of API Gateway request and response processing, the key differences are:

* In Lambda non-proxy integration, API Gateway expects the input to be in a specific format, and you need to map the client-supplied data to the Lambda function input. API Gateway does not perform any automatic mapping or transformation of the request data.
* In Lambda proxy integration, API Gateway automatically maps the client-supplied data to the Lambda function input, using the API configuration data, request headers, path variables, query string parameters, and body. API Gateway also handles the transformation of the request data into the format required by the Lambda function.

Overall, Lambda proxy integration provides a more streamlined and flexible way of integrating API Gateway with Lambda functions, while Lambda non-proxy integration requires more manual configuration and mapping of input data.

**Scores:** Faithfulness: 1 | Relevance: 1 | Context Accuracy: 1

---

## Question 26
**Query:** What is the minimum number of stages that must be defined in an HTTP API in API Gateway to enable CORS for a specific route, assuming the API has multiple integrations and uses OpenAPI for parameter mapping, and also requires a custom security policy to be applied?

**Ground Truth:**
> At least 1 stage must be defined, as CORS can be enabled at the stage level, and having multiple integrations and using OpenAPI for parameter mapping does not affect the minimum number of stages required.

**Retrieved Context (Proof):**
`	ext
Developer Guide
Amazon API Gateway
Copyright © 2026 Amazon Web Services, Inc. and/or its aﬃliates. All rights reserved.
Amazon API Gateway
Developer Guide
Amazon API Gateway: Developer Guide
Copyright © 2026 Amazon Web Services, Inc. and/or its aﬃliates. All rights reserved.
Amazon's trademarks and trade dress may not be used in connection with any product or service 
that is not Amazon's, in any manner that is likely to cause confusion among customers, or in any 
manner that disparages or discredits Amazon. All other trademarks not owned by Amazon are 
the property of their respective owners, who may or may not be aﬃliated with, connected to, or 
sponsored by Amazon.
Amazon API Gateway
Developer Guide
Table of Contents
What is Amazon API Gateway? ....................................................................................................... 1
Architecture of API Gateway ...................................................................................................................... 2
Features of API Gateway ............................................................................................................................. 2
API Gateway use cases ................................................................................................................................ 3
Use API Gateway to create REST APIs ................................................................................................ 3
Use API Gateway to create HTTP APIs ............................................................................................... 4
Use API Gateway to create WebSocket APIs ..................................................................................... 5
Who uses API Gateway? ........................................................................................................................ 5

API Gateway use cases ................................................................................................................................ 3
Use API Gateway to create REST APIs ................................................................................................ 3
Use API Gateway to create HTTP APIs ............................................................................................... 4
Use API Gateway to create WebSocket APIs ..................................................................................... 5
Who uses API Gateway? ........................................................................................................................ 5
Accessing API Gateway ................................................................................................................................ 6
Part of AWS serverless infrastructure ...................................................................................................... 7
How to get started with Amazon API Gateway ..................................................................................... 7
API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14

API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14
API management .................................................................................................................................. 15
Development .......................................................................................................................................... 15
Monitoring .............................................................................................................................................. 16
Integrations ............................................................................................................................................ 17
Get started with the REST API console ................................................................................................. 17
Step 1: Create a Lambda function .................................................................................................... 18
Step 2: Create a REST API .................................................................................................................. 19
Step 3: Create a Lambda proxy integration .................................................................................... 19

"ShardIterator": "$input.params('Shard-Iterator')"
}
18. Using the Test option in the API Gateway console, enter an existing stream name as the
stream-name Path variable value, set the Shard-Iterator Header to the ShardIterator
value obtained from the test run of the GET /streams/{stream-name}/sharditerator
method (above), and choose Test.
The successful response payload is similar to the following output:
{ 
  "MillisBehindLatest": 0, 
  "NextShardIterator": "AAAAAAAAAAF...", 
  "Records": [ ... ]
}
OpenAPI deﬁnitions of a sample API as a Kinesis proxy
Following are OpenAPI deﬁnitions for the sample API as a Kinesis proxy used in this tutorial.
Tutorial: Create a REST API as an Amazon Kinesis proxy
Amazon API Gateway
Developer Guide
OpenAPI 3.0
{ 
  "openapi": "3.0.0", 
  "info": { 
    "title": "KinesisProxy", 
    "version": "2016-03-31T18:25:32Z" 
  }, 
  "paths": { 
    "/streams/{stream-name}/sharditerator": { 
      "get": { 
        "parameters": [ 
          { 
            "name": "stream-name", 
            "in": "path", 
            "required": true, 
            "schema": { 
              "type": "string" 
            } 
          }, 
          { 
            "name": "shard-id", 
            "in": "query", 
            "schema": { 
              "type": "string" 
            } 
          } 
        ], 
        "responses": { 
          "200": { 
            "description": "200 response", 
            "content": { 
              "application/json": { 
                "schema": { 
                  "$ref": "#/components/schemas/Empty" 
                } 
              } 
            } 
          } 
        }, 
        "x-amazon-apigateway-integration": { 
          "type": "aws", 
          "credentials": "arn:aws:iam::123456789012:role/apigAwsProxyRole", 
          "uri": "arn:aws:apigateway:us-east-1:kinesis:action/GetShardIterator", 
Tutorial: Create a REST API as an Amazon Kinesis proxy
Amazon API Gateway
Developer Guide
          "responses": {

mechanism enacted on the API. To test the API execution in real time, you must deploy the API 
ﬁrst. To deploy an API, you create a stage to create a snapshot of the API at that time. The stage 
name also deﬁnes the base path after the API's default host name. The API's root resource is 
appended after the stage name. When you modify the API, you must redeploy it to a new or 
existing stage before the changes take eﬀect.
To deploy the API to a stage
Choose Deploy API.
For Stage, select New stage.
For Stage name, enter test.
Note
The input must be UTF-8 encoded (i.e., unlocalized) text.
(Optional) For Description, enter a description.
Choose Deploy.
Under Stage details, choose the copy icon to copy your API's invoke URL. The general pattern of 
the API's base URL is  For example, the 
base URL of the API (beags1mnid) created in the us-west-2 region and deployed to the test
stage is 
Test the API in a deployment stage
There are several ways you can test a deployed API. For GET requests using only URL path variables 
or query string parameters, you can enter the API resource URL in a browser. For other methods, 
you must use more advanced REST API testing utilities, such as POSTMAN or cURL.
Choose a Lambda integration tutorial
Amazon API Gateway
Developer Guide
To test the API using cURL
Open a terminal window on your local computer connected to the internet.
To test POST /Seattle?time=evening:
Copy the following cURL command and paste it into the terminal window.
curl -v -X POST \ 
  '
time=evening' \ 
  -H 'content-type: application/json' \ 
  -H 'day: Thursday' \ 
  -H 'x-amz-docs-region: us-west-2' \ 
  -d '{ 
 "callerName": "John"
}'
You should get a successful response with the following payload:
{"greeting":"Good evening, John of Seattle. Happy Thursday!"}
If you change POST to PUT in this method request, you get the same response.
Clean up
If you no longer need the Lambda functions you created for this walkthrough, you can delete them
`

**Generated Answer (Response):**
> 

The question is asking about the minimum number of stages required to enable CORS for a specific route in an HTTP API in API Gateway.

According to the provided context, there is no specific mention of CORS or the number of stages required to enable it. However, it does mention that to deploy an API, you create a stage to create a snapshot of the API at that time.

In general, to enable CORS in API Gateway, you need to define at least one stage and configure CORS on that stage. Therefore, the minimum number of stages required to enable CORS for a specific route is 1.

It's worth noting that the question mentions multiple integrations, OpenAPI for parameter mapping, and a custom security policy, but these details are not relevant to the minimum number of stages required to enable CORS.

**Scores:** Faithfulness: 1 | Relevance: 1 | Context Accuracy: 1

---

## Question 27
**Query:** What is the primary reason why API Gateway does not mediate to facilitate interactions between the client and backend, and how does this architectural decision impact the error handling and response parsing for the PetStore API, particularly when the client requests a resource that is not exposed by the backend, such as GET /petstore?

**Ground Truth:**
> API Gateway does not mediate to facilitate interactions between the client and backend because it is designed to act as a pass-through proxy, allowing the client to directly interact with the backend. This architectural decision means that the client is responsible for handling the output format of the backend and parsing the result correctly. When the client requests a resource that is not exposed by the backend, such as GET /petstore, API Gateway returns a 404 Resource Not Found response with an error message, and it is up to the client to handle this error response appropriately.

**Retrieved Context (Proof):**
`	ext
Developer Guide
Amazon API Gateway
Copyright © 2026 Amazon Web Services, Inc. and/or its aﬃliates. All rights reserved.
Amazon API Gateway
Developer Guide
Amazon API Gateway: Developer Guide
Copyright © 2026 Amazon Web Services, Inc. and/or its aﬃliates. All rights reserved.
Amazon's trademarks and trade dress may not be used in connection with any product or service 
that is not Amazon's, in any manner that is likely to cause confusion among customers, or in any 
manner that disparages or discredits Amazon. All other trademarks not owned by Amazon are 
the property of their respective owners, who may or may not be aﬃliated with, connected to, or 
sponsored by Amazon.
Amazon API Gateway
Developer Guide
Table of Contents
What is Amazon API Gateway? ....................................................................................................... 1
Architecture of API Gateway ...................................................................................................................... 2
Features of API Gateway ............................................................................................................................. 2
API Gateway use cases ................................................................................................................................ 3
Use API Gateway to create REST APIs ................................................................................................ 3
Use API Gateway to create HTTP APIs ............................................................................................... 4
Use API Gateway to create WebSocket APIs ..................................................................................... 5
Who uses API Gateway? ........................................................................................................................ 5

API Gateway use cases ................................................................................................................................ 3
Use API Gateway to create REST APIs ................................................................................................ 3
Use API Gateway to create HTTP APIs ............................................................................................... 4
Use API Gateway to create WebSocket APIs ..................................................................................... 5
Who uses API Gateway? ........................................................................................................................ 5
Accessing API Gateway ................................................................................................................................ 6
Part of AWS serverless infrastructure ...................................................................................................... 7
How to get started with Amazon API Gateway ..................................................................................... 7
API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14

API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14
API management .................................................................................................................................. 15
Development .......................................................................................................................................... 15
Monitoring .............................................................................................................................................. 16
Integrations ............................................................................................................................................ 17
Get started with the REST API console ................................................................................................. 17
Step 1: Create a Lambda function .................................................................................................... 18
Step 2: Create a REST API .................................................................................................................. 19
Step 3: Create a Lambda proxy integration .................................................................................... 19

endpoint. API Gateway responds with an overview of the PetStore website. This is an example of 
the MOCK integration type.
• GET /pets: for read access to the API's /pets resource that is integrated with the like-named 
backend /pets resource. The backend returns a page of available pets in the PetStore. This 
is an example of the HTTP integration type. The URL of the integration endpoint is http://
petstore-demo-endpoint.execute-api.com/petstore/pets.
Tutorial: Create a REST API by importing an example
Amazon API Gateway
Developer Guide
• POST /pets: for write access to the API's /pets resource that is integrated with the backend /
petstore/pets resource. Upon receiving a correct request, the backend adds the speciﬁed pet 
to the PetStore and returns the result to the caller. The integration is also HTTP.
• GET /pets/{petId}: for read access to a pet as identiﬁed by a petId value as speciﬁed as a 
path variable of the incoming request URL. This method also has the HTTP integration type. The 
backend returns the speciﬁed pet found in the PetStore. The URL of the backend HTTP endpoint 
is  where n is 
an integer as the identiﬁer of the queried pet.
The API supports CORS access via the OPTIONS methods of the MOCK integration type. API 
Gateway returns the required headers supporting CORS access.
The following procedure walks you through the steps to create and test an API from an example 
using the API Gateway Console.
To import, build, and test the example API
Sign in to the API Gateway console at 
Do one of the following:
•
To create your ﬁrst API, for REST API, choose Build.
•
If you've created an API before, choose Create API, and then choose Build for REST API.
Under Create REST API, choose Example API and then choose Create API to create the 
example API.
Tutorial: Create a REST API by importing an example
Amazon API Gateway
Developer Guide
You can scroll down the OpenAPI deﬁnition for details of this example API before choosing
Create API.

integration type, authorization type, and API key requirement.
To view the details of a method, to modify its set-up, or to test the method invocation, choose 
the method name from either the method list or the resource tree. Here, we choose the
POST /pets method as an illustration:
Tutorial: Create a REST API by importing an example
Amazon API Gateway
Developer Guide
The resulting Method execution pane presents a logical view of the chosen (POST /pets) 
method's structure and behaviors.
The Method request and Method response represent the API's interface with the frontend, 
and the Integration request and Integration response represent the API's interface with the 
backend.
A client uses the API to access a backend feature through the Method request. API Gateway 
translates the client request, if necessary, into the form acceptable to the backend in
Integration request before forwarding the incoming request to the backend. The transformed 
request is known as the integration request. Similarly, the backend returns the response to 
API Gateway in Integration response. API Gateway then routes it to Method Response before 
sending it to the client. Again, if necessary, API Gateway can map the backend response data 
to a form expected by the client.
Tutorial: Create a REST API by importing an example
Amazon API Gateway
Developer Guide
For the POST method on an API resource, the method request payload can be passed through 
to the integration request without modiﬁcation, if the method request's payload is of the same 
format as the integration request's payload.
The GET / method request uses the MOCK integration type and is not tied to any real backend 
endpoint. The corresponding Integration response is set up to return a static HTML page. 
When the method is called, the API Gateway simply accepts the request and immediately 
returns the conﬁgured integration response to the client by way of Method response. You can
`

**Generated Answer (Response):**
> 

The primary reason why API Gateway does not mediate to facilitate interactions between the client and backend is not mentioned in the provided context. API Gateway is designed to act as an entry point for clients to access backend resources, and it does mediate interactions between clients and backends.

However, based on the provided context, it can be inferred that API Gateway does mediate interactions between clients and backends. For example, in the POST /pets method, API Gateway translates the client request into the form acceptable to the backend in Integration request before forwarding the incoming request to the backend.

Regarding error handling and response parsing for the PetStore API, API Gateway can handle errors and parse responses based on the integration type and backend endpoint. For instance, if the client requests a resource that is not exposed by the backend, such as GET /petstore, API Gateway can return an error response to the client, depending on the configuration of the API.

In the provided example, the GET / method request uses the MOCK integration type and returns a static HTML page. If the client requests a resource that is not exposed by the backend, API Gateway can return a 404 Not Found error or a custom error response, depending on the API configuration.

**Scores:** Faithfulness: 1 | Relevance: 1 | Context Accuracy: 1

---

## Question 28
**Query:** What is the primary difference between the IP address types that can be used for HTTP APIs in API Gateway, and how would you configure API Gateway to utilize each type, considering the implications on route configuration and portal integration?

**Ground Truth:**
> The primary difference between the IP address types that can be used for HTTP APIs in API Gateway is that EDGE optimized IP addresses are used for API Gateway edge-optimized APIs, which are accessed through a CloudFront distribution, whereas REGIONAL IP addresses are used for API Gateway regional APIs, which are accessed directly from the region where the API is deployed. To configure API Gateway to utilize each type, you would need to specify the appropriate IP address type when creating the HTTP API, and then configure the routes accordingly. For EDGE optimized IP addresses, you would need to configure the API to use a CloudFront distribution, which would require setting up an origin and behavior for the distribution. For REGIONAL IP addresses, you would need to configure the API to use a regional endpoint, which would require setting up a regional API Gateway and configuring the routes to point to the regional endpoint. The implications on route configuration would be that EDGE optimized IP addresses would require routes to be configured to point to the CloudFront distribution, whereas REGIONAL IP addresses would require routes to be configured to point to the regional endpoint. The implications on portal integration would be that EDGE optimized IP addresses would require the portal to be configured to access the API through the CloudFront distribution, whereas REGIONAL IP addresses would require the portal to be configured to access the API directly from the region where the API is deployed.

**Retrieved Context (Proof):**
`	ext
Developer Guide
Amazon API Gateway
Copyright © 2026 Amazon Web Services, Inc. and/or its aﬃliates. All rights reserved.
Amazon API Gateway
Developer Guide
Amazon API Gateway: Developer Guide
Copyright © 2026 Amazon Web Services, Inc. and/or its aﬃliates. All rights reserved.
Amazon's trademarks and trade dress may not be used in connection with any product or service 
that is not Amazon's, in any manner that is likely to cause confusion among customers, or in any 
manner that disparages or discredits Amazon. All other trademarks not owned by Amazon are 
the property of their respective owners, who may or may not be aﬃliated with, connected to, or 
sponsored by Amazon.
Amazon API Gateway
Developer Guide
Table of Contents
What is Amazon API Gateway? ....................................................................................................... 1
Architecture of API Gateway ...................................................................................................................... 2
Features of API Gateway ............................................................................................................................. 2
API Gateway use cases ................................................................................................................................ 3
Use API Gateway to create REST APIs ................................................................................................ 3
Use API Gateway to create HTTP APIs ............................................................................................... 4
Use API Gateway to create WebSocket APIs ..................................................................................... 5
Who uses API Gateway? ........................................................................................................................ 5

API Gateway use cases ................................................................................................................................ 3
Use API Gateway to create REST APIs ................................................................................................ 3
Use API Gateway to create HTTP APIs ............................................................................................... 4
Use API Gateway to create WebSocket APIs ..................................................................................... 5
Who uses API Gateway? ........................................................................................................................ 5
Accessing API Gateway ................................................................................................................................ 6
Part of AWS serverless infrastructure ...................................................................................................... 7
How to get started with Amazon API Gateway ..................................................................................... 7
API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14

API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14
API management .................................................................................................................................. 15
Development .......................................................................................................................................... 15
Monitoring .............................................................................................................................................. 16
Integrations ............................................................................................................................................ 17
Get started with the REST API console ................................................................................................. 17
Step 1: Create a Lambda function .................................................................................................... 18
Step 2: Create a REST API .................................................................................................................. 19
Step 3: Create a Lambda proxy integration .................................................................................... 19

API Gateway HTTP APIs ............................................................................................................ 1159
Develop .................................................................................................................................................... 1159
Creating an HTTP API ..................................................................................................................... 1160
Routes ................................................................................................................................................. 1161
IP address types for HTTP APIs in API Gateway ........................................................................ 1164
Access control ................................................................................................................................... 1166
Integrations ....................................................................................................................................... 1185
CORS ................................................................................................................................................... 1203
Parameter mapping ......................................................................................................................... 1206
OpenAPI ............................................................................................................................................. 1213
Publish ..................................................................................................................................................... 1223
Stages ................................................................................................................................................. 1224
Security policy for HTTP APIs in API Gateway ........................................................................... 1226

WebSocket API quotas ......................................................................................................................... 1491
Important notes ..................................................................................................................................... 1493
Amazon API Gateway important notes for HTTP APIs ............................................................. 1493
Amazon API Gateway important notes for HTTP and WebSocket APIs ................................ 1494
Important notes for REST APIs and WebSocket APIs ............................................................... 1494
Important notes for WebSocket APIs .......................................................................................... 1494
Important notes for REST APIs ..................................................................................................... 1494
Document history ...................................................................................................................... 1501
Earlier updates ....................................................................................................................................... 1513
xi
Amazon API Gateway
Developer Guide
What is Amazon API Gateway?
Amazon API Gateway is an AWS service for creating, publishing, maintaining, monitoring, and 
securing REST, HTTP, and WebSocket APIs at any scale. API developers can create APIs that access 
AWS or other web services, as well as data stored in the AWS Cloud. As an API Gateway API 
developer, you can create APIs for use in your own client applications. Or you can make your APIs 
available to third-party app developers. For more information, see the section called “Who uses API 
Gateway?”.
API Gateway creates RESTful APIs that:
• Are HTTP-based.
• Enable stateless client-server communication.
• Implement standard HTTP methods such as GET, POST, PUT, PATCH, and DELETE.
`

**Generated Answer (Response):**
> 

According to the provided context, the primary difference between the IP address types that can be used for HTTP APIs in API Gateway is not explicitly stated. However, based on the section "IP address types for HTTP APIs in API Gateway" on page 1164, we can infer that API Gateway supports two types of IP addresses: Edge-optimized and Regional.

Edge-optimized IP addresses are optimized for latency and are suitable for APIs that need to be accessed from the internet. To configure API Gateway to use Edge-optimized IP addresses, you would:

1. Create an HTTP API in API Gateway.
2. Choose the Edge-optimized option when creating the API.
3. Configure the API's route settings to use the Edge-optimized IP address.

Regional IP addresses are suitable for APIs that need to be accessed from within a specific AWS Region. To configure API Gateway to use Regional IP addresses, you would:

1. Create an HTTP API in API Gateway.
2. Choose the Regional option when creating the API.
3. Configure the API's route settings to use the Regional IP address.

The implications on route configuration and portal integration are:

* Edge-optimized IP addresses may require additional configuration for route 53 and SSL certificates.
* Regional IP addresses may require additional configuration for VPC links and private APIs.
* Portal integration may vary depending on the chosen IP address type, as Edge-optimized IP addresses may require additional setup for API Gateway's built-in portal, while Regional IP addresses may require custom portal integration.

Please note that the provided context does not provide explicit information on the primary difference between the IP address types, and the above answer is based on general knowledge of API Gateway.

**Scores:** Faithfulness: 0 | Relevance: 1 | Context Accuracy: 1

---

## Question 29
**Query:** What AWS service can be used to automate the creation and cleanup of resources, such as the REST API, Lambda function, log group, and execution role, and provides example templates for API Gateway in the awsdocs GitHub repository?

**Ground Truth:**
> AWS CloudFormation or AWS Serverless Application Model (AWS SAM)

**Retrieved Context (Proof):**
`	ext
Developer Guide
Amazon API Gateway
Copyright © 2026 Amazon Web Services, Inc. and/or its aﬃliates. All rights reserved.
Amazon API Gateway
Developer Guide
Amazon API Gateway: Developer Guide
Copyright © 2026 Amazon Web Services, Inc. and/or its aﬃliates. All rights reserved.
Amazon's trademarks and trade dress may not be used in connection with any product or service 
that is not Amazon's, in any manner that is likely to cause confusion among customers, or in any 
manner that disparages or discredits Amazon. All other trademarks not owned by Amazon are 
the property of their respective owners, who may or may not be aﬃliated with, connected to, or 
sponsored by Amazon.
Amazon API Gateway
Developer Guide
Table of Contents
What is Amazon API Gateway? ....................................................................................................... 1
Architecture of API Gateway ...................................................................................................................... 2
Features of API Gateway ............................................................................................................................. 2
API Gateway use cases ................................................................................................................................ 3
Use API Gateway to create REST APIs ................................................................................................ 3
Use API Gateway to create HTTP APIs ............................................................................................... 4
Use API Gateway to create WebSocket APIs ..................................................................................... 5
Who uses API Gateway? ........................................................................................................................ 5

API Gateway use cases ................................................................................................................................ 3
Use API Gateway to create REST APIs ................................................................................................ 3
Use API Gateway to create HTTP APIs ............................................................................................... 4
Use API Gateway to create WebSocket APIs ..................................................................................... 5
Who uses API Gateway? ........................................................................................................................ 5
Accessing API Gateway ................................................................................................................................ 6
Part of AWS serverless infrastructure ...................................................................................................... 7
How to get started with Amazon API Gateway ..................................................................................... 7
API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14

API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14
API management .................................................................................................................................. 15
Development .......................................................................................................................................... 15
Monitoring .............................................................................................................................................. 16
Integrations ............................................................................................................................................ 17
Get started with the REST API console ................................................................................................. 17
Step 1: Create a Lambda function .................................................................................................... 18
Step 2: Create a REST API .................................................................................................................. 19
Step 3: Create a Lambda proxy integration .................................................................................... 19

x-amazon-apigateway-gateway-responses.responseTemplates .................................................. 1390
x-amazon-apigateway-gateway-responses.responseTemplates example ............................. 1391
x-amazon-apigateway-importexport-version .................................................................................. 1391
viii
Amazon API Gateway
Developer Guide
x-amazon-apigateway-importexport-version example ............................................................ 1391
x-amazon-apigateway-integration ........................................................................................ 1392
x-amazon-apigateway-integration examples ............................................................................. 1399
x-amazon-apigateway-integrations ................................................................................................... 1401
x-amazon-apigateway-integrations example ............................................................................. 1401
x-amazon-apigateway-integration.requestTemplates .................................................................... 1403
x-amazon-apigateway-integration.requestTemplates example .............................................. 1403
x-amazon-apigateway-integration.requestParameters .................................................................. 1404
x-amazon-apigateway-integration.requestParameters example ....................... 1405
x-amazon-apigateway-integration.responses .................................................................................. 1405
x-amazon-apigateway-integration.responses example ........................................... 1407
x-amazon-apigateway-integration.response .................................................................................... 1407
x-amazon-apigateway-integration.response example ............................................. 1409

as part of this exercise. The following steps delete your REST API, your Lambda function, and the 
associated resources.
To delete your REST API
In the Resources pane, choose API actions, Delete API.
In the Delete API dialog box, enter conﬁrm, and then choose Delete.
To delete your Lambda function
Sign in to the Lambda console at 
On the Functions page, select your function. Choose Actions, Delete.
(Optional) Step 6: Clean up
Amazon API Gateway
Developer Guide
In the Delete 1 functions dialog box, enter delete, and then choose Delete.
To delete your Lambda function's log group
Open the Log groups page of the Amazon CloudWatch console.
On the Log groups page, select your function's log group (/aws/lambda/my-function). 
Then, for Actions, choose Delete log group(s).
In the Delete log group(s) dialog box, choose Delete.
To delete your Lambda function's execution role
Open the Roles page of the IAM console.
(Optional) On the Roles page, in the search box, enter my-function.
Select your function's role (for example, my-function-31exxmpl), and then choose Delete.
In the Delete my-function-31exxmpl? dialog box, enter the name of the role, and then 
choose Delete.
Tip
You can automate the creation and cleanup of AWS resources by using AWS 
CloudFormation or AWS Serverless Application Model (AWS SAM). For some example 
CloudFormation templates, see the example templates for API Gateway in the awsdocs
GitHub repository.
(Optional) Step 6: Clean up
Amazon API Gateway
Developer Guide
Set up to use API Gateway
Before you use Amazon API Gateway for the ﬁrst time, complete the following tasks.
Sign up for an AWS account
To get started with AWS, you need an AWS account. For information about creating an AWS 
account, see Getting started with an AWS account in the AWS Account Management Reference 
Guide.
Sign up for an AWS account
Amazon API Gateway
Developer Guide
Get started with API Gateway
`

**Generated Answer (Response):**
> 

According to the provided context, the AWS service that can be used to automate the creation and cleanup of resources, such as the REST API, Lambda function, log group, and execution role, and provides example templates for API Gateway in the awsdocs GitHub repository is AWS CloudFormation. Additionally, AWS Serverless Application Model (AWS SAM) is also mentioned as an option.

**Scores:** Faithfulness: 1 | Relevance: 1 | Context Accuracy: 1

---

## Question 30
**Query:** What is the minimum number of times you need to redeploy an API to a stage in order to ensure that changes to the API's root resource take effect, assuming the API is initially deployed to a stage named 'test' and the changes involve modifying the API's root resource, adding a new query string parameter, and updating the description of the stage?

**Ground Truth:**
> At least 2 times

**Retrieved Context (Proof):**
`	ext
Developer Guide
Amazon API Gateway
Copyright © 2026 Amazon Web Services, Inc. and/or its aﬃliates. All rights reserved.
Amazon API Gateway
Developer Guide
Amazon API Gateway: Developer Guide
Copyright © 2026 Amazon Web Services, Inc. and/or its aﬃliates. All rights reserved.
Amazon's trademarks and trade dress may not be used in connection with any product or service 
that is not Amazon's, in any manner that is likely to cause confusion among customers, or in any 
manner that disparages or discredits Amazon. All other trademarks not owned by Amazon are 
the property of their respective owners, who may or may not be aﬃliated with, connected to, or 
sponsored by Amazon.
Amazon API Gateway
Developer Guide
Table of Contents
What is Amazon API Gateway? ....................................................................................................... 1
Architecture of API Gateway ...................................................................................................................... 2
Features of API Gateway ............................................................................................................................. 2
API Gateway use cases ................................................................................................................................ 3
Use API Gateway to create REST APIs ................................................................................................ 3
Use API Gateway to create HTTP APIs ............................................................................................... 4
Use API Gateway to create WebSocket APIs ..................................................................................... 5
Who uses API Gateway? ........................................................................................................................ 5

API Gateway use cases ................................................................................................................................ 3
Use API Gateway to create REST APIs ................................................................................................ 3
Use API Gateway to create HTTP APIs ............................................................................................... 4
Use API Gateway to create WebSocket APIs ..................................................................................... 5
Who uses API Gateway? ........................................................................................................................ 5
Accessing API Gateway ................................................................................................................................ 6
Part of AWS serverless infrastructure ...................................................................................................... 7
How to get started with Amazon API Gateway ..................................................................................... 7
API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14

API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14
API management .................................................................................................................................. 15
Development .......................................................................................................................................... 15
Monitoring .............................................................................................................................................. 16
Integrations ............................................................................................................................................ 17
Get started with the REST API console ................................................................................................. 17
Step 1: Create a Lambda function .................................................................................................... 18
Step 2: Create a REST API .................................................................................................................. 19
Step 3: Create a Lambda proxy integration .................................................................................... 19

"ShardIterator": "$input.params('Shard-Iterator')"
}
18. Using the Test option in the API Gateway console, enter an existing stream name as the
stream-name Path variable value, set the Shard-Iterator Header to the ShardIterator
value obtained from the test run of the GET /streams/{stream-name}/sharditerator
method (above), and choose Test.
The successful response payload is similar to the following output:
{ 
  "MillisBehindLatest": 0, 
  "NextShardIterator": "AAAAAAAAAAF...", 
  "Records": [ ... ]
}
OpenAPI deﬁnitions of a sample API as a Kinesis proxy
Following are OpenAPI deﬁnitions for the sample API as a Kinesis proxy used in this tutorial.
Tutorial: Create a REST API as an Amazon Kinesis proxy
Amazon API Gateway
Developer Guide
OpenAPI 3.0
{ 
  "openapi": "3.0.0", 
  "info": { 
    "title": "KinesisProxy", 
    "version": "2016-03-31T18:25:32Z" 
  }, 
  "paths": { 
    "/streams/{stream-name}/sharditerator": { 
      "get": { 
        "parameters": [ 
          { 
            "name": "stream-name", 
            "in": "path", 
            "required": true, 
            "schema": { 
              "type": "string" 
            } 
          }, 
          { 
            "name": "shard-id", 
            "in": "query", 
            "schema": { 
              "type": "string" 
            } 
          } 
        ], 
        "responses": { 
          "200": { 
            "description": "200 response", 
            "content": { 
              "application/json": { 
                "schema": { 
                  "$ref": "#/components/schemas/Empty" 
                } 
              } 
            } 
          } 
        }, 
        "x-amazon-apigateway-integration": { 
          "type": "aws", 
          "credentials": "arn:aws:iam::123456789012:role/apigAwsProxyRole", 
          "uri": "arn:aws:apigateway:us-east-1:kinesis:action/GetShardIterator", 
Tutorial: Create a REST API as an Amazon Kinesis proxy
Amazon API Gateway
Developer Guide
          "responses": {

Thu Aug 31 01:07:25 UTC 2017 : Endpoint response headers: {x-amzn-Remapped-Content-
Length=0, x-amzn-RequestId=c0475a28-8de8-11e7-8d3f-4183da788f0f, Connection=keep-
alive, Content-Length=62, Date=Thu, 31 Aug 2017 01:07:25 GMT, X-Amzn-Trace-
Id=root=1-59a7614d-373151b01b0713127e646635;sampled=0, Content-Type=application/json}
Thu Aug 31 01:07:25 UTC 2017 : Method response body after transformations: 
 {"greeting":"Good morning, John of Seattle. Happy Wednesday!"}
Thu Aug 31 01:07:25 UTC 2017 : Method response headers: {X-Amzn-Trace-
Id=sampled=0;root=1-59a7614d-373151b01b0713127e646635, Content-Type=application/json}
Thu Aug 31 01:07:25 UTC 2017 : Successfully completed execution
Thu Aug 31 01:07:25 UTC 2017 : Method completed with status: 200
Choose a Lambda integration tutorial
Amazon API Gateway
Developer Guide
The logs show the incoming request before the mapping and the integration request after the 
mapping. When a test fails, the logs are useful for evaluating whether the original input is correct 
or the mapping template works correctly.
Deploy the API
The test invocation is a simulation and has limitations. For example, it bypasses any authorization 
mechanism enacted on the API. To test the API execution in real time, you must deploy the API 
ﬁrst. To deploy an API, you create a stage to create a snapshot of the API at that time. The stage 
name also deﬁnes the base path after the API's default host name. The API's root resource is 
appended after the stage name. When you modify the API, you must redeploy it to a new or 
existing stage before the changes take eﬀect.
To deploy the API to a stage
Choose Deploy API.
For Stage, select New stage.
For Stage name, enter test.
Note
The input must be UTF-8 encoded (i.e., unlocalized) text.
(Optional) For Description, enter a description.
Choose Deploy.
Under Stage details, choose the copy icon to copy your API's invoke URL. The general pattern of 
the API's base URL is  For example, the
`

**Generated Answer (Response):**
> 

According to the provided context, you need to redeploy the API to a stage only once to ensure that changes to the API's root resource take effect. The context states: "When you modify the API, you must redeploy it to a new or existing stage before the changes take effect." It does not mention that you need to redeploy multiple times for different types of changes. Therefore, the minimum number of times you need to redeploy an API to a stage is 1.

**Scores:** Faithfulness: 1 | Relevance: 1 | Context Accuracy: 1

---

## Question 31
**Query:** What is the primary purpose of using service-linked roles in conjunction with API Gateway resources that can be tagged, and how does it relate to compliance validation and infrastructure security in a resilient architecture?

**Ground Truth:**
> Service-linked roles are used to delegate permissions to AWS services to perform actions on behalf of the user, and in the context of API Gateway, it enables the service to create and manage necessary resources. This is related to compliance validation and infrastructure security as it ensures that the API Gateway resources are properly configured and secured, and that the necessary permissions are in place to meet compliance requirements, thereby contributing to a resilient architecture.

**Retrieved Context (Proof):**
`	ext
Developer Guide
Amazon API Gateway
Copyright © 2026 Amazon Web Services, Inc. and/or its aﬃliates. All rights reserved.
Amazon API Gateway
Developer Guide
Amazon API Gateway: Developer Guide
Copyright © 2026 Amazon Web Services, Inc. and/or its aﬃliates. All rights reserved.
Amazon's trademarks and trade dress may not be used in connection with any product or service 
that is not Amazon's, in any manner that is likely to cause confusion among customers, or in any 
manner that disparages or discredits Amazon. All other trademarks not owned by Amazon are 
the property of their respective owners, who may or may not be aﬃliated with, connected to, or 
sponsored by Amazon.
Amazon API Gateway
Developer Guide
Table of Contents
What is Amazon API Gateway? ....................................................................................................... 1
Architecture of API Gateway ...................................................................................................................... 2
Features of API Gateway ............................................................................................................................. 2
API Gateway use cases ................................................................................................................................ 3
Use API Gateway to create REST APIs ................................................................................................ 3
Use API Gateway to create HTTP APIs ............................................................................................... 4
Use API Gateway to create WebSocket APIs ..................................................................................... 5
Who uses API Gateway? ........................................................................................................................ 5

API Gateway use cases ................................................................................................................................ 3
Use API Gateway to create REST APIs ................................................................................................ 3
Use API Gateway to create HTTP APIs ............................................................................................... 4
Use API Gateway to create WebSocket APIs ..................................................................................... 5
Who uses API Gateway? ........................................................................................................................ 5
Accessing API Gateway ................................................................................................................................ 6
Part of AWS serverless infrastructure ...................................................................................................... 7
How to get started with Amazon API Gateway ..................................................................................... 7
API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14

API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14
API management .................................................................................................................................. 15
Development .......................................................................................................................................... 15
Monitoring .............................................................................................................................................. 16
Integrations ............................................................................................................................................ 17
Get started with the REST API console ................................................................................................. 17
Step 1: Create a Lambda function .................................................................................................... 18
Step 2: Create a REST API .................................................................................................................. 19
Step 3: Create a Lambda proxy integration .................................................................................... 19

• Integration with AWS X-Ray for understanding and triaging performance latencies.
For a complete list of API Gateway feature releases, see Document history.
API Gateway use cases
The following use cases section presents an overview of the diﬀerent types of API Gateway APIs 
and the diﬀerent kinds of developers who use API Gateway. For more detailed information about 
the diﬀerence between REST APIs and HTTP APIs, see the section called “Choose between REST 
APIs and HTTP APIs ”.
Topics
• Use API Gateway to create REST APIs
• Use API Gateway to create HTTP APIs
• Use API Gateway to create WebSocket APIs
• Who uses API Gateway?
Use API Gateway to create REST APIs
An API Gateway REST API is made up of resources and methods. A resource is a logical entity that 
an app can access through a resource path. A method corresponds to a REST API request that is 
submitted by the user of your API and the response returned to the user.
API Gateway use cases
Amazon API Gateway
Developer Guide
For example, /incomes could be the path of a resource representing the income of the app user. 
A resource can have one or more operations that are deﬁned by appropriate HTTP verbs such as 
GET, POST, PUT, PATCH, and DELETE. A combination of a resource path and an operation identiﬁes 
a method of the API. For example, a POST /incomes method could add an income earned by the 
caller, and a GET /expenses method could query the reported expenses incurred by the caller.
The app doesn't need to know where the requested data is stored and fetched from on the 
backend. In API Gateway REST APIs, the frontend is encapsulated by method requests and method 
responses. The API interfaces with the backend by means of integration requests and integration 
responses.
For example, with DynamoDB as the backend, the API developer sets up the integration request 
to forward the incoming method request to the chosen backend. The setup includes speciﬁcations

Publish ..................................................................................................................................................... 1329
Stages ................................................................................................................................................. 1330
Deploy a WebSocket API ................................................................................................................ 1332
Security policy for WebSocket APIs in API Gateway ................................................................. 1335
Custom domain names ................................................................................................................... 1337
Protect ...................................................................................................................................................... 1344
Account-level throttling per Region ............................................................................................. 1345
Route-level throttling ...................................................................................................................... 1345
Monitor .................................................................................................................................................... 1345
Metrics ................................................................................................................................................ 1346
Logging ............................................................................................................................................... 1348
API Gateway ARNs ..................................................................................................................... 1357
vii
Amazon API Gateway
Developer Guide
HTTP API and WebSocket API resources .......................................................................................... 1357
`

**Generated Answer (Response):**
> 

The provided context does not mention service-linked roles or their purpose in conjunction with API Gateway resources. The context primarily focuses on the features, use cases, and concepts of Amazon API Gateway. Therefore, it is not possible to answer this question based on the provided context.

**Scores:** Faithfulness: 1 | Relevance: 0 | Context Accuracy: 1

---

## Question 32
**Query:** What is the recommended approach to implement canary release deployments for safely rolling out changes to an API Gateway REST API that integrates with AWS WAF for protecting against common web exploits, and also utilizes CloudWatch access logging and execution logging with alarms, while ensuring seamless authentication using AWS Identity and Access Management policies and Lambda authorizer functions?

**Ground Truth:**
> To implement canary release deployments for an API Gateway REST API that integrates with AWS WAF and utilizes CloudWatch logging with alarms, while ensuring seamless authentication using IAM policies and Lambda authorizer functions, you should create multiple stages in API Gateway, each with its own configuration, and then use API Gateway's built-in canary release feature to route a percentage of traffic to the new stage. Additionally, you should configure WAF to protect both stages, and set up CloudWatch logging and alarms for each stage. Finally, you should implement authentication using IAM policies and Lambda authorizer functions, and ensure that the authentication mechanisms are applied consistently across both stages.

**Retrieved Context (Proof):**
`	ext
Developer Guide
Amazon API Gateway
Copyright © 2026 Amazon Web Services, Inc. and/or its aﬃliates. All rights reserved.
Amazon API Gateway
Developer Guide
Amazon API Gateway: Developer Guide
Copyright © 2026 Amazon Web Services, Inc. and/or its aﬃliates. All rights reserved.
Amazon's trademarks and trade dress may not be used in connection with any product or service 
that is not Amazon's, in any manner that is likely to cause confusion among customers, or in any 
manner that disparages or discredits Amazon. All other trademarks not owned by Amazon are 
the property of their respective owners, who may or may not be aﬃliated with, connected to, or 
sponsored by Amazon.
Amazon API Gateway
Developer Guide
Table of Contents
What is Amazon API Gateway? ....................................................................................................... 1
Architecture of API Gateway ...................................................................................................................... 2
Features of API Gateway ............................................................................................................................. 2
API Gateway use cases ................................................................................................................................ 3
Use API Gateway to create REST APIs ................................................................................................ 3
Use API Gateway to create HTTP APIs ............................................................................................... 4
Use API Gateway to create WebSocket APIs ..................................................................................... 5
Who uses API Gateway? ........................................................................................................................ 5

API Gateway use cases ................................................................................................................................ 3
Use API Gateway to create REST APIs ................................................................................................ 3
Use API Gateway to create HTTP APIs ............................................................................................... 4
Use API Gateway to create WebSocket APIs ..................................................................................... 5
Who uses API Gateway? ........................................................................................................................ 5
Accessing API Gateway ................................................................................................................................ 6
Part of AWS serverless infrastructure ...................................................................................................... 7
How to get started with Amazon API Gateway ..................................................................................... 7
API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14

API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14
API management .................................................................................................................................. 15
Development .......................................................................................................................................... 15
Monitoring .............................................................................................................................................. 16
Integrations ............................................................................................................................................ 17
Get started with the REST API console ................................................................................................. 17
Step 1: Create a Lambda function .................................................................................................... 18
Step 2: Create a REST API .................................................................................................................. 19
Step 3: Create a Lambda proxy integration .................................................................................... 19

infrastructure. To learn more about getting started with serverless, see the Serverless Developer 
Guide.
For an app to call publicly available AWS services, you can use Lambda to interact with required 
services and expose Lambda functions through API methods in API Gateway. AWS Lambda runs 
your code on a highly available computing infrastructure. It performs the necessary execution and 
administration of computing resources. To enable serverless applications, API Gateway supports
streamlined proxy integrations with AWS Lambda and HTTP endpoints.
How to get started with Amazon API Gateway
For an introduction to Amazon API Gateway, see the following:
• Get started, which provides a walkthrough for creating an HTTP API.
• Serverless land, which provides instructional videos.
• Happy Little API Shorts, which is a series of brief instructional videos.
Amazon API Gateway concepts
The following section describes introductory concepts for using API Gateway.
API Gateway
API Gateway is an AWS service that supports the following:
• Creating, deploying, and managing a RESTful application programming interface (API) to 
expose backend HTTP endpoints, AWS Lambda functions, or other AWS services.
Part of AWS serverless infrastructure
Amazon API Gateway
Developer Guide
• Creating, deploying, and managing a WebSocket API to expose AWS Lambda functions or 
other AWS services.
• Invoking exposed API methods through the frontend HTTP and WebSocket endpoints.
API Gateway REST API
A collection of HTTP resources and methods that are integrated with backend HTTP endpoints, 
Lambda functions, or other AWS services. You can deploy this collection in one or more stages. 
Typically, API resources are organized in a resource tree according to the application logic. Each 
API resource can expose one or more API methods that have unique HTTP verbs supported by 
API Gateway. For more information, see the section called “Choose between REST APIs and 
HTTP APIs ”.
API Gateway HTTP API
`

**Generated Answer (Response):**
> 

The recommended approach to implement canary release deployments for safely rolling out changes to an API Gateway REST API that integrates with AWS WAF for protecting against common web exploits, and also utilizes CloudWatch access logging and execution logging with alarms, while ensuring seamless authentication using AWS Identity and Access Management policies and Lambda authorizer functions is as follows:

1. **Create a new stage**: In API Gateway, create a new stage for the canary release. This stage will have a separate configuration from the production stage.

2. **Route a percentage of traffic**: Use API Gateway's built-in support for canary releases to route a percentage of traffic to the new stage. This allows you to test the changes with a small subset of users before rolling it out to everyone.

3. **Configure AWS WAF**: Ensure that the new stage is also protected by AWS WAF. You can do this by creating a new web ACL or associating the existing web ACL with the new stage.

4. **Monitor with CloudWatch**: Set up CloudWatch access logging and execution logging for the new stage. This will allow you to monitor the performance and errors of the canary release.

5. **Configure alarms**: Set up alarms in CloudWatch to notify you of any issues with the canary release. This could include errors, latency, or other performance metrics.

6. **Use IAM policies and Lambda authorizer functions**: Ensure that the new stage uses the same IAM policies and Lambda authorizer functions as the production stage. This will ensure seamless authentication and authorization for the canary release.

7. **Gradually increase traffic**: Once you're confident that the canary release is working as expected, you can gradually increase the percentage of traffic routed to the new stage.

8. **Promote to production**: Once the canary release has been fully tested and validated, you can promote it to the production stage.

By following this approach, you can safely roll out changes to your API Gateway REST API while ensuring that it's protected by AWS WAF, monitored by CloudWatch, and authenticated using IAM policies and Lambda authorizer functions.

**Scores:** Faithfulness: 0 | Relevance: 1 | Context Accuracy: 1

---

## Question 33
**Query:** What is the minimum number of possible sources from which the Lambda function can retrieve the value of the 'greeter' variable, considering the provided code snippet, and how would you modify the code to add an additional source for the 'greeter' value?

**Ground Truth:**
> The minimum number of possible sources from which the Lambda function can retrieve the value of the 'greeter' variable is 5: event.greeter, event.body.greeter, event.queryStringParameters.greeter, event.multiValueHeaders.greeter, and event.headers.greeter. To add an additional source, such as a path parameter, you would need to modify the code to include an additional conditional statement, for example: else if (event.pathParameters && event.pathParameters.greeter && event.pathParameters.greeter !== '') { greeter = event.pathParameters.greeter; }

**Retrieved Context (Proof):**
`	ext
Integrations ............................................................................................................................................ 17
Get started with the REST API console ................................................................................................. 17
Step 1: Create a Lambda function .................................................................................................... 18
Step 2: Create a REST API .................................................................................................................. 19
Step 3: Create a Lambda proxy integration .................................................................................... 19
Step 4: Deploy your API ...................................................................................................................... 20
Step 5: Invoke your API ....................................................................................................................... 20
(Optional) Step 6: Clean up ................................................................................................................ 21
Prerequisites .................................................................................................................................. 23
Sign up for an AWS account ................................................................................................................... 23
Get started ..................................................................................................................................... 24
Step 1: Create a Lambda function ......................................................................................................... 25
Step 2: Create an HTTP API ..................................................................................................................... 25

API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14
API management .................................................................................................................................. 15
Development .......................................................................................................................................... 15
Monitoring .............................................................................................................................................. 16
Integrations ............................................................................................................................................ 17
Get started with the REST API console ................................................................................................. 17
Step 1: Create a Lambda function .................................................................................................... 18
Step 2: Create a REST API .................................................................................................................. 19
Step 3: Create a Lambda proxy integration .................................................................................... 19

Prerequisites .................................................................................................................................. 23
Sign up for an AWS account ................................................................................................................... 23
Get started ..................................................................................................................................... 24
Step 1: Create a Lambda function ......................................................................................................... 25
Step 2: Create an HTTP API ..................................................................................................................... 25
Step 3: Test your API ................................................................................................................................ 26
(Optional) Step 4: Clean up ..................................................................................................................... 27
iii
Amazon API Gateway
Developer Guide
Next steps .................................................................................................................................................... 28
Tutorials and workshops ............................................................................................................... 30
REST API tutorials ...................................................................................................................................... 31
Choose a Lambda integration tutorial ............................................................................................. 31
Tutorial: Create a REST API by importing an example .................................................................. 55
Choose an HTTP integration tutorial ............................................................................................... 65

Integration has the following relationship: RELATES_TO with Lambda

x-amazon-apigateway-tag-value has the following relationship: PART_OF with Amazon API Gateway

AWS Identity and Access Management (IAM) has the following relationship: PROVIDES with Policies

AWS Identity and Access Management (IAM) has the following relationship: WORKS_WITH with AWS CloudTrail

AWS Identity and Access Management (IAM) has the following relationship: MANAGES with AWS account

Resource-based Policy has the following relationship: RELATES_TO with AWS Services

Tagging has the following relationship: RELATES_TO with Resource Tags

API Developer has the following relationship: USES with AWS CloudFormation

API Developer has the following relationship: USES with AWS Command Line Interface (AWS CLI)

AWS Identity and Access Management has the following relationship: PART_OF with AWS

AWS CloudFormation has the following relationship: SUPPORTS with API Gateway

AWS CloudFormation has the following relationship: PART_OF with AWS
`

**Generated Answer (Response):**
> 

There is no provided code snippet in the context. The context appears to be a table of contents or an index from an AWS API Gateway Developer Guide. It does not contain any code snippets. Therefore, it is not possible to determine the minimum number of possible sources from which the Lambda function can retrieve the value of the 'greeter' variable. Additionally, it is not possible to modify the code to add an additional source for the 'greeter' value without a code snippet to work with.

**Scores:** Faithfulness: 1 | Relevance: 1 | Context Accuracy: 1

---

## Question 34
**Query:** What is the minimum page number in the Amazon API Gateway Developer Guide where you can find information about implementing content encoding for an optimized REST API, assuming you have already set up a custom domain name and are planning to distribute the API with usage plans and API documentation?

**Ground Truth:**
> 853

**Retrieved Context (Proof):**
`	ext
Developer Guide
Amazon API Gateway
Copyright © 2026 Amazon Web Services, Inc. and/or its aﬃliates. All rights reserved.
Amazon API Gateway
Developer Guide
Amazon API Gateway: Developer Guide
Copyright © 2026 Amazon Web Services, Inc. and/or its aﬃliates. All rights reserved.
Amazon's trademarks and trade dress may not be used in connection with any product or service 
that is not Amazon's, in any manner that is likely to cause confusion among customers, or in any 
manner that disparages or discredits Amazon. All other trademarks not owned by Amazon are 
the property of their respective owners, who may or may not be aﬃliated with, connected to, or 
sponsored by Amazon.
Amazon API Gateway
Developer Guide
Table of Contents
What is Amazon API Gateway? ....................................................................................................... 1
Architecture of API Gateway ...................................................................................................................... 2
Features of API Gateway ............................................................................................................................. 2
API Gateway use cases ................................................................................................................................ 3
Use API Gateway to create REST APIs ................................................................................................ 3
Use API Gateway to create HTTP APIs ............................................................................................... 4
Use API Gateway to create WebSocket APIs ..................................................................................... 5
Who uses API Gateway? ........................................................................................................................ 5

API Gateway use cases ................................................................................................................................ 3
Use API Gateway to create REST APIs ................................................................................................ 3
Use API Gateway to create HTTP APIs ............................................................................................... 4
Use API Gateway to create WebSocket APIs ..................................................................................... 5
Who uses API Gateway? ........................................................................................................................ 5
Accessing API Gateway ................................................................................................................................ 6
Part of AWS serverless infrastructure ...................................................................................................... 7
How to get started with Amazon API Gateway ..................................................................................... 7
API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14

API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14
API management .................................................................................................................................. 15
Development .......................................................................................................................................... 15
Monitoring .............................................................................................................................................. 16
Integrations ............................................................................................................................................ 17
Get started with the REST API console ................................................................................................. 17
Step 1: Create a Lambda function .................................................................................................... 18
Step 2: Create a REST API .................................................................................................................. 19
Step 3: Create a Lambda proxy integration .................................................................................... 19

iv
Amazon API Gateway
Developer Guide
Publish ........................................................................................................................................................ 726
Deploy REST APIs ............................................................................................................................... 726
Custom domain names ..................................................................................................................... 771
Optimize ..................................................................................................................................................... 840
Cache settings ..................................................................................................................................... 840
Content encoding ............................................................................................................................... 853
Distribute ................................................................................................................................................... 859
Usage plans .......................................................................................................................................... 859
API documentation ............................................................................................................................. 886
SDK generation ................................................................................................................................... 949
Sell your APIs as SaaS ....................................................................................................................... 976
Protect ........................................................................................................................................................ 980

encoded JSON content, additional API settings are necessary. This is outlined as follows:
Tutorial: Create a REST API as an Amazon S3 proxy
Amazon API Gateway
Developer Guide
To download or upload binary ﬁles from S3
Register the media types of the aﬀected ﬁle to the API's binaryMediaTypes. You can do this in 
the console:
a.
Choose API settings for the API.
b.
Under Binary media types, choose Manage media types.
c.
Choose Add binary media type, and then enter the required media type, for example,
image/png.
d.
Choose Save changes to save the setting.
Add the Content-Type (for upload) and/or Accept (for download) header to the method 
request to require the client to specify the required binary media type and map them to the 
integration request.
Set Content Handling to Passthrough in the integration request (for upload) and in a 
integration response (for download). Make sure that no mapping template is deﬁned for the 
aﬀected content type. For more information, see the section called “Data transformations”.
The payload size limit is 10 MB. See Quotas for conﬁguring and running a REST API in API Gateway.
Make sure that ﬁles on Amazon S3 have the correct content types added as the ﬁles' metadata. For 
streamable media content, Content-Disposition:inline may also need to be added to the 
metadata.
For more information about the binary support in API Gateway, see Content type conversions in 
API Gateway.
OpenAPI deﬁnitions of the sample API as an Amazon S3 proxy
The following OpenAPI deﬁnitions describes an API that works as an Amazon S3 proxy. This API 
contains more Amazon S3 operations than the API you created in the tutorial. The following 
methods are exposed in the OpenAPI deﬁnitions:
• Expose GET on the API's root resource to list all of the Amazon S3 buckets of a caller.
• Expose GET on a Folder resource to view a list of all of the objects in an Amazon S3 bucket.
• Expose PUT on a Folder resource to add a bucket to Amazon S3.
`

**Generated Answer (Response):**
> 

According to the provided context, the information about implementing content encoding for an optimized REST API can be found on page 853.

**Scores:** Faithfulness: 1 | Relevance: 1 | Context Accuracy: 1

---

## Question 35
**Query:** What is the minimum number of stages required to deploy a WebSocket API in API Gateway, considering the API has custom domain names, binary media types, and request validation, and assuming the security policy for WebSocket APIs is already defined?

**Ground Truth:**
> 1

**Retrieved Context (Proof):**
`	ext
Developer Guide
Amazon API Gateway
Copyright © 2026 Amazon Web Services, Inc. and/or its aﬃliates. All rights reserved.
Amazon API Gateway
Developer Guide
Amazon API Gateway: Developer Guide
Copyright © 2026 Amazon Web Services, Inc. and/or its aﬃliates. All rights reserved.
Amazon's trademarks and trade dress may not be used in connection with any product or service 
that is not Amazon's, in any manner that is likely to cause confusion among customers, or in any 
manner that disparages or discredits Amazon. All other trademarks not owned by Amazon are 
the property of their respective owners, who may or may not be aﬃliated with, connected to, or 
sponsored by Amazon.
Amazon API Gateway
Developer Guide
Table of Contents
What is Amazon API Gateway? ....................................................................................................... 1
Architecture of API Gateway ...................................................................................................................... 2
Features of API Gateway ............................................................................................................................. 2
API Gateway use cases ................................................................................................................................ 3
Use API Gateway to create REST APIs ................................................................................................ 3
Use API Gateway to create HTTP APIs ............................................................................................... 4
Use API Gateway to create WebSocket APIs ..................................................................................... 5
Who uses API Gateway? ........................................................................................................................ 5

API Gateway use cases ................................................................................................................................ 3
Use API Gateway to create REST APIs ................................................................................................ 3
Use API Gateway to create HTTP APIs ............................................................................................... 4
Use API Gateway to create WebSocket APIs ..................................................................................... 5
Who uses API Gateway? ........................................................................................................................ 5
Accessing API Gateway ................................................................................................................................ 6
Part of AWS serverless infrastructure ...................................................................................................... 7
How to get started with Amazon API Gateway ..................................................................................... 7
API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14

API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14
API management .................................................................................................................................. 15
Development .......................................................................................................................................... 15
Monitoring .............................................................................................................................................. 16
Integrations ............................................................................................................................................ 17
Get started with the REST API console ................................................................................................. 17
Step 1: Create a Lambda function .................................................................................................... 18
Step 2: Create a REST API .................................................................................................................. 19
Step 3: Create a Lambda proxy integration .................................................................................... 19

Resource-based policy examples .................................................................................................. 1444
Troubleshooting ................................................................................................................................ 1445
Using service-linked roles ............................................................................................................... 1446
Logging and monitoring ...................................................................................................................... 1451
Working with CloudTrail ................................................................................................................. 1453
Working with AWS Conﬁg .............................................................................................................. 1456
Compliance validation .......................................................................................................................... 1459
Resilience ................................................................................................................................................. 1459
Infrastructure security .......................................................................................................................... 1460
Conﬁguration and vulnerability analysis .......................................................................................... 1461
Best practices ......................................................................................................................................... 1461
Tagging ....................................................................................................................................... 1463
API Gateway resources that can be tagged ..................................................................................... 1463

}
You can also view the logs to examine how API Gateway processes the request and response.
Execution log for request test-request
Thu Aug 31 01:07:25 UTC 2017 : Starting execution for request: test-invoke-request
Thu Aug 31 01:07:25 UTC 2017 : HTTP Method: POST, Resource Path: /Seattle
Thu Aug 31 01:07:25 UTC 2017 : Method request path: {city=Seattle}
Thu Aug 31 01:07:25 UTC 2017 : Method request query string: {time=morning}
Choose a Lambda integration tutorial
Amazon API Gateway
Developer Guide
Thu Aug 31 01:07:25 UTC 2017 : Method request headers: {day=Wednesday}
Thu Aug 31 01:07:25 UTC 2017 : Method request body before transformations: 
 { "callerName": "John" }
Thu Aug 31 01:07:25 UTC 2017 : Request validation succeeded for content type 
 application/json
Thu Aug 31 01:07:25 UTC 2017 : Endpoint request URI: https://
lambda.us-west-2.amazonaws.com/2015-03-31/functions/arn:aws:lambda:us-
west-2:123456789012:function:GetStartedLambdaIntegration/invocations
Thu Aug 31 01:07:25 UTC 2017 : Endpoint request headers: {x-amzn-lambda-integration-
tag=test-request, 
 Authorization=********************************************************************************
 X-Amz-Date=20170831T010725Z, x-amzn-apigateway-api-id=beags1mnid, X-Amz-
Source-Arn=arn:aws:execute-api:us-west-2:123456789012:beags1mnid/null/POST/
{city}, Accept=application/json, User-Agent=AmazonAPIGateway_beags1mnid, 
 X-Amz-Security-Token=FQoDYXdzELL//////////wEaDMHGzEdEOT/VvGhabiK3AzgKrJw
+3zLqJZG4PhOq12K6W21+QotY2rrZyOzqhLoiuRg3CAYNQ2eqgL5D54+63ey9bIdtwHGoyBdq8ecWxJK/
YUnT2Rau0L9HCG5p7FC05h3IvwlFfvcidQNXeYvsKJTLXI05/
yEnY3ttIAnpNYLOezD9Es8rBfyruHfJfOqextKlsC8DymCcqlGkig8qLKcZ0hWJWVwiPJiFgL7laabXs+
+ZhCa4hdZo4iqlG729DE4gaV1mJVdoAagIUwLMo+y4NxFDu0r7I0/
EO5nYcCrppGVVBYiGk7H4T6sXuhTkbNNqVmXtV3ch5bOlh7 [TRUNCATED]
Thu Aug 31 01:07:25 UTC 2017 : Endpoint request body after transformations: { 
  "city": "Seattle", 
  "time": "morning", 
  "day": "Wednesday", 
  "name" : "John"
}
`

**Generated Answer (Response):**
> 

According to the provided context, the minimum number of stages required to deploy a WebSocket API in API Gateway is 1. This is because API Gateway allows you to deploy a WebSocket API with custom domain names, binary media types, and request validation in a single stage.

**Scores:** Faithfulness: 1 | Relevance: 1 | Context Accuracy: 1

---

## Question 36
**Query:** What is the primary reason why the Lambda function implementation in Node.js and Python differs in terms of error handling for invalid input, despite both implementations aiming to achieve the same functionality of a calculator REST API?

**Ground Truth:**
> The primary reason is that Node.js uses asynchronous error handling with try-catch blocks, whereas Python uses synchronous error handling with try-except blocks, which leads to differences in error handling implementation for invalid input.

**Retrieved Context (Proof):**
`	ext
Developer Guide
Amazon API Gateway
Copyright © 2026 Amazon Web Services, Inc. and/or its aﬃliates. All rights reserved.
Amazon API Gateway
Developer Guide
Amazon API Gateway: Developer Guide
Copyright © 2026 Amazon Web Services, Inc. and/or its aﬃliates. All rights reserved.
Amazon's trademarks and trade dress may not be used in connection with any product or service 
that is not Amazon's, in any manner that is likely to cause confusion among customers, or in any 
manner that disparages or discredits Amazon. All other trademarks not owned by Amazon are 
the property of their respective owners, who may or may not be aﬃliated with, connected to, or 
sponsored by Amazon.
Amazon API Gateway
Developer Guide
Table of Contents
What is Amazon API Gateway? ....................................................................................................... 1
Architecture of API Gateway ...................................................................................................................... 2
Features of API Gateway ............................................................................................................................. 2
API Gateway use cases ................................................................................................................................ 3
Use API Gateway to create REST APIs ................................................................................................ 3
Use API Gateway to create HTTP APIs ............................................................................................... 4
Use API Gateway to create WebSocket APIs ..................................................................................... 5
Who uses API Gateway? ........................................................................................................................ 5

API Gateway use cases ................................................................................................................................ 3
Use API Gateway to create REST APIs ................................................................................................ 3
Use API Gateway to create HTTP APIs ............................................................................................... 4
Use API Gateway to create WebSocket APIs ..................................................................................... 5
Who uses API Gateway? ........................................................................................................................ 5
Accessing API Gateway ................................................................................................................................ 6
Part of AWS serverless infrastructure ...................................................................................................... 7
How to get started with Amazon API Gateway ..................................................................................... 7
API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14

API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14
API management .................................................................................................................................. 15
Development .......................................................................................................................................... 15
Monitoring .............................................................................................................................................. 16
Integrations ............................................................................................................................................ 17
Get started with the REST API console ................................................................................................. 17
Step 1: Create a Lambda function .................................................................................................... 18
Step 2: Create a REST API .................................................................................................................. 19
Step 3: Create a Lambda proxy integration .................................................................................... 19

endpoints, Lambda functions, or other AWS services. You can deploy this collection in one or 
more stages. API methods are invoked through frontend WebSocket connections that you can 
associate with a registered custom domain name.
API deployment
A point-in-time snapshot of your API Gateway API. To be available for clients to use, the 
deployment must be associated with one or more API stages.
API developer
Your AWS account that owns an API Gateway deployment (for example, a service provider that 
also supports programmatic access).
API endpoint
A hostname for an API in API Gateway that is deployed to a speciﬁc Region. The hostname is of 
the form {api-id}.execute-api.{region}.amazonaws.com. The following types of API 
endpoints are supported:
• Edge-optimized API endpoint
API Gateway concepts
Amazon API Gateway
Developer Guide
• Private API endpoint
• Regional API endpoint
API key
An alphanumeric string that API Gateway uses to identify an app developer who uses your 
REST or WebSocket API. API Gateway can generate API keys on your behalf, or you can import 
them from a CSV ﬁle. You can use API keys together with Lambda authorizers or usage plans to 
control access to your APIs.
See API endpoints.
API owner
See API developer.
API stage
A logical reference to a lifecycle state of your API (for example, 'dev', 'prod', 'beta', 'v2'). API 
stages are identiﬁed by API ID and stage name.
App developer
An app creator who may or may not have an AWS account and interacts with the API that you, 
the API developer, have deployed. App developers are your customers. An app developer is 
typically identiﬁed by an API key.
Callback URL
When a new client is connected to through a WebSocket connection, you can call an integration 
in API Gateway to store the client's callback URL. You can then use that callback URL to send 
messages to the client from the backend system.
Developer portal
An application where API providers can share their APIs and API documentation to API

Part of AWS serverless infrastructure
Amazon API Gateway
Developer Guide
• Creating, deploying, and managing a WebSocket API to expose AWS Lambda functions or 
other AWS services.
• Invoking exposed API methods through the frontend HTTP and WebSocket endpoints.
API Gateway REST API
A collection of HTTP resources and methods that are integrated with backend HTTP endpoints, 
Lambda functions, or other AWS services. You can deploy this collection in one or more stages. 
Typically, API resources are organized in a resource tree according to the application logic. Each 
API resource can expose one or more API methods that have unique HTTP verbs supported by 
API Gateway. For more information, see the section called “Choose between REST APIs and 
HTTP APIs ”.
API Gateway HTTP API
A collection of routes and methods that are integrated with backend HTTP endpoints or 
Lambda functions. You can deploy this collection in one or more stages. Each route can expose 
one or more API methods that have unique HTTP verbs supported by API Gateway. For more 
information, see the section called “Choose between REST APIs and HTTP APIs ”.
API Gateway WebSocket API
A collection of WebSocket routes and route keys that are integrated with backend HTTP 
endpoints, Lambda functions, or other AWS services. You can deploy this collection in one or 
more stages. API methods are invoked through frontend WebSocket connections that you can 
associate with a registered custom domain name.
API deployment
A point-in-time snapshot of your API Gateway API. To be available for clients to use, the 
deployment must be associated with one or more API stages.
API developer
Your AWS account that owns an API Gateway deployment (for example, a service provider that 
also supports programmatic access).
API endpoint
A hostname for an API in API Gateway that is deployed to a speciﬁc Region. The hostname is of 
the form {api-id}.execute-api.{region}.amazonaws.com. The following types of API
`

**Generated Answer (Response):**
> 

The provided context does not mention anything about Lambda function implementation in Node.js and Python, or error handling for invalid input. The context appears to be a developer guide for Amazon API Gateway, and it discusses various concepts related to API Gateway, such as API deployment, API endpoints, API keys, and more. It does not provide information about Lambda function implementation or error handling in specific programming languages. Therefore, it is not possible to answer this question based on the provided context.

**Scores:** Faithfulness: 1 | Relevance: 1 | Context Accuracy: 1

---

## Question 37
**Query:** What is the primary difference in the way the 'greeter' variable is handled when it is extracted from the 'multiValueHeaders' versus the 'headers' section of the event object in the provided Lambda function code, and how does this impact the resulting API response?

**Ground Truth:**
> The primary difference is that when 'greeter' is extracted from 'multiValueHeaders', it is joined into a single string using the ' and '.join() method, whereas when it is extracted from 'headers', it is used as is. This impacts the API response because if 'greeter' is a list of values in 'multiValueHeaders', it will be concatenated into a single string, whereas if it is a single value in 'headers', it will be used as is, resulting in a different response body.

**Retrieved Context (Proof):**
`	ext
Integrations ............................................................................................................................................ 17
Get started with the REST API console ................................................................................................. 17
Step 1: Create a Lambda function .................................................................................................... 18
Step 2: Create a REST API .................................................................................................................. 19
Step 3: Create a Lambda proxy integration .................................................................................... 19
Step 4: Deploy your API ...................................................................................................................... 20
Step 5: Invoke your API ....................................................................................................................... 20
(Optional) Step 6: Clean up ................................................................................................................ 21
Prerequisites .................................................................................................................................. 23
Sign up for an AWS account ................................................................................................................... 23
Get started ..................................................................................................................................... 24
Step 1: Create a Lambda function ......................................................................................................... 25
Step 2: Create an HTTP API ..................................................................................................................... 25

API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14
API management .................................................................................................................................. 15
Development .......................................................................................................................................... 15
Monitoring .............................................................................................................................................. 16
Integrations ............................................................................................................................................ 17
Get started with the REST API console ................................................................................................. 17
Step 1: Create a Lambda function .................................................................................................... 18
Step 2: Create a REST API .................................................................................................................. 19
Step 3: Create a Lambda proxy integration .................................................................................... 19

Prerequisites .................................................................................................................................. 23
Sign up for an AWS account ................................................................................................................... 23
Get started ..................................................................................................................................... 24
Step 1: Create a Lambda function ......................................................................................................... 25
Step 2: Create an HTTP API ..................................................................................................................... 25
Step 3: Test your API ................................................................................................................................ 26
(Optional) Step 4: Clean up ..................................................................................................................... 27
iii
Amazon API Gateway
Developer Guide
Next steps .................................................................................................................................................... 28
Tutorials and workshops ............................................................................................................... 30
REST API tutorials ...................................................................................................................................... 31
Choose a Lambda integration tutorial ............................................................................................. 31
Tutorial: Create a REST API by importing an example .................................................................. 55
Choose an HTTP integration tutorial ............................................................................................... 65

X-Amz-Date=20170831T010725Z, x-amzn-apigateway-api-id=beags1mnid, X-Amz-
Source-Arn=arn:aws:execute-api:us-west-2:123456789012:beags1mnid/null/POST/
{city}, Accept=application/json, User-Agent=AmazonAPIGateway_beags1mnid, 
 X-Amz-Security-Token=FQoDYXdzELL//////////wEaDMHGzEdEOT/VvGhabiK3AzgKrJw
+3zLqJZG4PhOq12K6W21+QotY2rrZyOzqhLoiuRg3CAYNQ2eqgL5D54+63ey9bIdtwHGoyBdq8ecWxJK/
YUnT2Rau0L9HCG5p7FC05h3IvwlFfvcidQNXeYvsKJTLXI05/
yEnY3ttIAnpNYLOezD9Es8rBfyruHfJfOqextKlsC8DymCcqlGkig8qLKcZ0hWJWVwiPJiFgL7laabXs+
+ZhCa4hdZo4iqlG729DE4gaV1mJVdoAagIUwLMo+y4NxFDu0r7I0/
EO5nYcCrppGVVBYiGk7H4T6sXuhTkbNNqVmXtV3ch5bOlh7 [TRUNCATED]
Thu Aug 31 01:07:25 UTC 2017 : Endpoint request body after transformations: { 
  "city": "Seattle", 
  "time": "morning", 
  "day": "Wednesday", 
  "name" : "John"
}
Thu Aug 31 01:07:25 UTC 2017 : Sending request to 
west-2.amazonaws.com/2015-03-31/functions/arn:aws:lambda:us-
west-2:123456789012:function:GetStartedLambdaIntegration/invocations
Thu Aug 31 01:07:25 UTC 2017 : Received response. Integration latency: 328 ms
Thu Aug 31 01:07:25 UTC 2017 : Endpoint response body before transformations: 
 {"greeting":"Good morning, John of Seattle. Happy Wednesday!"}
Thu Aug 31 01:07:25 UTC 2017 : Endpoint response headers: {x-amzn-Remapped-Content-
Length=0, x-amzn-RequestId=c0475a28-8de8-11e7-8d3f-4183da788f0f, Connection=keep-
alive, Content-Length=62, Date=Thu, 31 Aug 2017 01:07:25 GMT, X-Amzn-Trace-
Id=root=1-59a7614d-373151b01b0713127e646635;sampled=0, Content-Type=application/json}
Thu Aug 31 01:07:25 UTC 2017 : Method response body after transformations: 
 {"greeting":"Good morning, John of Seattle. Happy Wednesday!"}
Thu Aug 31 01:07:25 UTC 2017 : Method response headers: {X-Amzn-Trace-
Id=sampled=0;root=1-59a7614d-373151b01b0713127e646635, Content-Type=application/json}
Thu Aug 31 01:07:25 UTC 2017 : Successfully completed execution
Thu Aug 31 01:07:25 UTC 2017 : Method completed with status: 200
Choose a Lambda integration tutorial

map the backend Content-Type header parameter value to the frontend counterpart. Otherwise, 
the client will receive application/json for the content type when the response body is actually 
an XML string. The following procedure shows how to set this up. In addition, you also want to 
display to the client other header parameters, such as Date and Content-Length.
To set up response header mappings for the GET / method
On the Integration response tab, under Default - Response, choose Edit.
For the Content-Length header, enter integration.response.header.Content-Length
for the mapping value.
For the Content-Type header, enter integration.response.header.Content-Type for 
the mapping value.
For the Timestamp header, enter integration.response.header.Date for the mapping 
value.
Choose Save. The result should look similar to the following:
Tutorial: Create a REST API as an Amazon S3 proxy
Amazon API Gateway
Developer Guide
On the Integration response tab, under Integration responses, choose Create response.
For HTTP status regex, enter 4\d{2}. This maps all 4xx HTTP response status codes to the 
method response.
For Method response status code, select 400.
Choose Create.
10. Repeat the following steps to create an integration response for the 500 method response. For
HTTP status regex, enter 5\d{2}.
Tutorial: Create a REST API as an Amazon S3 proxy
Amazon API Gateway
Developer Guide
As a good practice, you can test the API you have conﬁgured so far.
To test the GET / method
Choose the Test tab. You might need to choose the right arrow button to show the tab.
Choose Test. The result should look like the following image:
Expose API methods to access an Amazon S3 bucket
To work with an Amazon S3 bucket, you expose the GET method on the /{folder} resource to list 
objects in a bucket. The instructions are similar to those described in Expose an API method to list 
the caller's Amazon S3 buckets. For more methods, you can import the sample API here, OpenAPI
`

**Generated Answer (Response):**
> 

There is no mention of a 'greeter' variable or 'multiValueHeaders' in the provided context. The context appears to be a tutorial on creating a REST API using API Gateway and Lambda, and it does not include any Lambda function code that extracts a 'greeter' variable from an event object. Therefore, it is not possible to answer this question based on the provided context.

**Scores:** Faithfulness: 1 | Relevance: 1 | Context Accuracy: 1

---

## Question 38
**Query:** In an API Gateway setup, if an API developer wants to generate a strongly typed SDK for an API that uses a mock integration, what is the minimum requirement that must be configured to validate payloads and associate a response with a given status code?

**Ground Truth:**
> A model (data schema) must be configured to specify the data structure of the request or response payload, and the method's integration request and integration response must be configured to associate a response with a given status code.

**Retrieved Context (Proof):**
`	ext
API Gateway use cases ................................................................................................................................ 3
Use API Gateway to create REST APIs ................................................................................................ 3
Use API Gateway to create HTTP APIs ............................................................................................... 4
Use API Gateway to create WebSocket APIs ..................................................................................... 5
Who uses API Gateway? ........................................................................................................................ 5
Accessing API Gateway ................................................................................................................................ 6
Part of AWS serverless infrastructure ...................................................................................................... 7
How to get started with Amazon API Gateway ..................................................................................... 7
API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14

Developer Guide
Amazon API Gateway
Copyright © 2026 Amazon Web Services, Inc. and/or its aﬃliates. All rights reserved.
Amazon API Gateway
Developer Guide
Amazon API Gateway: Developer Guide
Copyright © 2026 Amazon Web Services, Inc. and/or its aﬃliates. All rights reserved.
Amazon's trademarks and trade dress may not be used in connection with any product or service 
that is not Amazon's, in any manner that is likely to cause confusion among customers, or in any 
manner that disparages or discredits Amazon. All other trademarks not owned by Amazon are 
the property of their respective owners, who may or may not be aﬃliated with, connected to, or 
sponsored by Amazon.
Amazon API Gateway
Developer Guide
Table of Contents
What is Amazon API Gateway? ....................................................................................................... 1
Architecture of API Gateway ...................................................................................................................... 2
Features of API Gateway ............................................................................................................................. 2
API Gateway use cases ................................................................................................................................ 3
Use API Gateway to create REST APIs ................................................................................................ 3
Use API Gateway to create HTTP APIs ............................................................................................... 4
Use API Gateway to create WebSocket APIs ..................................................................................... 5
Who uses API Gateway? ........................................................................................................................ 5

API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14
API management .................................................................................................................................. 15
Development .......................................................................................................................................... 15
Monitoring .............................................................................................................................................. 16
Integrations ............................................................................................................................................ 17
Get started with the REST API console ................................................................................................. 17
Step 1: Create a Lambda function .................................................................................................... 18
Step 2: Create a REST API .................................................................................................................. 19
Step 3: Create a Lambda proxy integration .................................................................................... 19

x-amazon-apigateway-gateway-responses.responseTemplates .................................................. 1390
x-amazon-apigateway-gateway-responses.responseTemplates example ............................. 1391
x-amazon-apigateway-importexport-version .................................................................................. 1391
viii
Amazon API Gateway
Developer Guide
x-amazon-apigateway-importexport-version example ............................................................ 1391
x-amazon-apigateway-integration ........................................................................................ 1392
x-amazon-apigateway-integration examples ............................................................................. 1399
x-amazon-apigateway-integrations ................................................................................................... 1401
x-amazon-apigateway-integrations example ............................................................................. 1401
x-amazon-apigateway-integration.requestTemplates .................................................................... 1403
x-amazon-apigateway-integration.requestTemplates example .............................................. 1403
x-amazon-apigateway-integration.requestParameters .................................................................. 1404
x-amazon-apigateway-integration.requestParameters example ....................... 1405
x-amazon-apigateway-integration.responses .................................................................................. 1405
x-amazon-apigateway-integration.responses example ........................................... 1407
x-amazon-apigateway-integration.response .................................................................................... 1407
x-amazon-apigateway-integration.response example ............................................. 1409

Amazon API Gateway
Developer Guide
To test the method
Choose the Test tab. You might need to choose the right arrow button to show the tab.
Under Path for petId, enter 4.
Choose Test.
If successful, Response body displays the following:
{ 
  "id": 4, 
  "type": "bird", 
  "price": 999.99
}
Step 3: Deploy the API
In this step, you deploy the API so that you can begin calling it outside of the API Gateway console.
To deploy the API
Choose Deploy API.
For Stage, select Prod.
(Optional) For Description, enter a description.
Choose Deploy.
Step 4: Test the API
In this step, you go outside of the API Gateway console and use your API to access the HTTP 
endpoint.
In the main navigation pane, choose Stage.
Under Stage details, choose the copy icon to copy your API's invoke URL.
It should look something like this:
Choose an HTTP integration tutorial
Amazon API Gateway
Developer Guide
Enter this URL in the address box of a new browser tab and append /pets/4 to the URL 
before you submit your request.
The browser will return the following:
{ 
  "id": 4, 
  "type": "bird", 
  "price": 999.99
}
Next steps
You can further customize your API by turning on request validation, transforming data, or creating 
custom gateway responses.
To explore more ways to customize your API, see the following tutorials:
• For more information about request validation, see Set up basic request validation in API 
Gateway.
• For information about how to transform request and response payloads, see Tutorial: Modify the 
integration request and response for integrations to AWS services.
• For information about how to create custom gateway responses see, Set up a gateway response 
for a REST API using the API Gateway console.
Tutorial: Create a REST API with a private integration
In this tutorial, you create a REST API that connects to an Amazon ECS service that runs in an 
Amazon VPC. Clients outside of your Amazon VPC can use the API to access your Amazon ECS 
service.
`

**Generated Answer (Response):**
> 

Based on the provided context, the minimum requirement to validate payloads and associate a response with a given status code is to configure "Request Validation" and "Gateway Responses".

Request Validation allows you to define a schema for the request payload, which enables API Gateway to validate the payload against the schema.

Gateway Responses enable you to define custom responses for specific HTTP status codes, which allows you to associate a response with a given status code.

By configuring these two features, the API developer can generate a strongly typed SDK for the API that uses a mock integration.

**Scores:** Faithfulness: 1 | Relevance: 1 | Context Accuracy: 1

---

## Question 39
**Query:** What is the total number of quota types and important notes sections mentioned in the Amazon API Gateway Developer Guide, and how do they differ in terms of API types (REST, HTTP, WebSocket, and Portal)?

**Ground Truth:**
> There are 9 quota types (API Gateway account-level quotas, API Gateway quotas for creating, deploying and managing an API, REST API quotas, HTTP API quotas, Portal quotas, WebSocket API quotas, and 3 types of important notes sections) that differ in terms of API types as follows: 2 for HTTP APIs, 2 for HTTP and WebSocket APIs, 2 for REST APIs and WebSocket APIs, and 1 for WebSocket APIs, with some quotas and notes applicable to multiple API types.

**Retrieved Context (Proof):**
`	ext
Developer Guide
Amazon API Gateway
Copyright © 2026 Amazon Web Services, Inc. and/or its aﬃliates. All rights reserved.
Amazon API Gateway
Developer Guide
Amazon API Gateway: Developer Guide
Copyright © 2026 Amazon Web Services, Inc. and/or its aﬃliates. All rights reserved.
Amazon's trademarks and trade dress may not be used in connection with any product or service 
that is not Amazon's, in any manner that is likely to cause confusion among customers, or in any 
manner that disparages or discredits Amazon. All other trademarks not owned by Amazon are 
the property of their respective owners, who may or may not be aﬃliated with, connected to, or 
sponsored by Amazon.
Amazon API Gateway
Developer Guide
Table of Contents
What is Amazon API Gateway? ....................................................................................................... 1
Architecture of API Gateway ...................................................................................................................... 2
Features of API Gateway ............................................................................................................................. 2
API Gateway use cases ................................................................................................................................ 3
Use API Gateway to create REST APIs ................................................................................................ 3
Use API Gateway to create HTTP APIs ............................................................................................... 4
Use API Gateway to create WebSocket APIs ..................................................................................... 5
Who uses API Gateway? ........................................................................................................................ 5

API Gateway use cases ................................................................................................................................ 3
Use API Gateway to create REST APIs ................................................................................................ 3
Use API Gateway to create HTTP APIs ............................................................................................... 4
Use API Gateway to create WebSocket APIs ..................................................................................... 5
Who uses API Gateway? ........................................................................................................................ 5
Accessing API Gateway ................................................................................................................................ 6
Part of AWS serverless infrastructure ...................................................................................................... 7
How to get started with Amazon API Gateway ..................................................................................... 7
API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14

API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14
API management .................................................................................................................................. 15
Development .......................................................................................................................................... 15
Monitoring .............................................................................................................................................. 16
Integrations ............................................................................................................................................ 17
Get started with the REST API console ................................................................................................. 17
Step 1: Create a Lambda function .................................................................................................... 18
Step 2: Create a REST API .................................................................................................................. 19
Step 3: Create a Lambda proxy integration .................................................................................... 19

x-amazon-apigateway-gateway-responses.responseTemplates .................................................. 1390
x-amazon-apigateway-gateway-responses.responseTemplates example ............................. 1391
x-amazon-apigateway-importexport-version .................................................................................. 1391
viii
Amazon API Gateway
Developer Guide
x-amazon-apigateway-importexport-version example ............................................................ 1391
x-amazon-apigateway-integration ........................................................................................ 1392
x-amazon-apigateway-integration examples ............................................................................. 1399
x-amazon-apigateway-integrations ................................................................................................... 1401
x-amazon-apigateway-integrations example ............................................................................. 1401
x-amazon-apigateway-integration.requestTemplates .................................................................... 1403
x-amazon-apigateway-integration.requestTemplates example .............................................. 1403
x-amazon-apigateway-integration.requestParameters .................................................................. 1404
x-amazon-apigateway-integration.requestParameters example ....................... 1405
x-amazon-apigateway-integration.responses .................................................................................. 1405
x-amazon-apigateway-integration.responses example ........................................... 1407
x-amazon-apigateway-integration.response .................................................................................... 1407
x-amazon-apigateway-integration.response example ............................................. 1409

This exercise uses an HTTP API. API Gateway also supports REST APIs, which include more 
features. For a tutorial using a REST API, see the section called “Get started with the REST 
API console”.
For more information about the diﬀerence between HTTP APIs and REST APIs, see the 
section called “Choose between REST APIs and HTTP APIs ”.
When you invoke your HTTP API, API Gateway routes the request to your Lambda function. 
Lambda runs the Lambda function and returns a response to API Gateway. API Gateway then 
returns a response to you.
To complete this exercise, you need an AWS account and an AWS Identity and Access Management 
user with console access. For more information, see Prerequisites.
Topics
• Step 1: Create a Lambda function
• Step 2: Create an HTTP API
• Step 3: Test your API
• (Optional) Step 4: Clean up
Amazon API Gateway
Developer Guide
• Next steps
Step 1: Create a Lambda function
You use a Lambda function for the backend of your API. Lambda runs your code only when needed 
and scales automatically, from a few requests per day to thousands per second.
For this example, you use the default Node.js function from the Lambda console.
To create a Lambda function
Sign in to the Lambda console at 
Choose Create function.
For Function name, enter my-function.
For all other options, use the default setting.
Choose Create function.
The example function returns a 200 response to clients, and the text Hello from Lambda!.
You can modify your Lambda function, as long as the function's response aligns with the format 
that API Gateway requires.
The default Lambda function code should look similar to the following:
export const handler = async (event) => { 
    const response = { 
        statusCode: 200, 
        body: JSON.stringify('Hello from Lambda!'), 
    }; 
    return response;
};
Step 2: Create an HTTP API
Next, you create an HTTP API. API Gateway also supports REST APIs and WebSocket APIs, but an
`

**Generated Answer (Response):**
> 

Based on the provided context, there are no quota types mentioned in the Amazon API Gateway Developer Guide. However, there are several sections that discuss important notes, concepts, and features of API Gateway, including:

1. API Gateway concepts
2. Choose between REST APIs and HTTP APIs
3. Endpoint type
4. Security
5. Authorization
6. API management
7. Development
8. Monitoring
9. Integrations
10. x-amazon-apigateway-gateway-responses.responseTemplates
11. x-amazon-apigateway-importexport-version
12. x-amazon-apigateway-integration
13. x-amazon-apigateway-integrations
14. x-amazon-apigateway-integration.requestTemplates
15. x-amazon-apigateway-integration.requestParameters
16. x-amazon-apigateway-integration.responses
17. x-amazon-apigateway-integration.response

These sections do not specifically discuss quota types, but rather provide information on how to use API Gateway, its features, and its different API types (REST, HTTP, WebSocket, and Portal).

In terms of API types, the guide mentions the following:

* REST APIs: Support more features than HTTP APIs, and have a separate tutorial in the guide.
* HTTP APIs: Used in the exercise provided, and have a more streamlined architecture than REST APIs.
* WebSocket APIs: Supported by API Gateway, but not discussed in detail in the provided context.
* Portal: Not mentioned in the provided context.

Note that the guide does not provide a direct comparison of quota types between these API types, as quota types are not discussed in the provided context.

**Scores:** Faithfulness: 1 | Relevance: 1 | Context Accuracy: 1

---

## Question 40
**Query:** In an edge-optimized API endpoint deployed to a specific Region using a CloudFront distribution, how would you design the integration request and response to ensure that WebSocket API route requests from geographically diverse clients are routed to the nearest CloudFront Point of Presence (POP) while maintaining the correct callback URL for sending messages to the client from the backend system?

**Ground Truth:**
> You would design the integration request to map the body of the WebSocket API route request to the formats required by the backend, and then use the callback URL stored in the integration to send messages to the client from the backend system. In the integration response, you would map the status codes, headers, and payload received from the backend to the response format returned to the client app, ensuring that the callback URL is correctly routed to the nearest CloudFront POP.

**Retrieved Context (Proof):**
`	ext
Developer Guide
Amazon API Gateway
Copyright © 2026 Amazon Web Services, Inc. and/or its aﬃliates. All rights reserved.
Amazon API Gateway
Developer Guide
Amazon API Gateway: Developer Guide
Copyright © 2026 Amazon Web Services, Inc. and/or its aﬃliates. All rights reserved.
Amazon's trademarks and trade dress may not be used in connection with any product or service 
that is not Amazon's, in any manner that is likely to cause confusion among customers, or in any 
manner that disparages or discredits Amazon. All other trademarks not owned by Amazon are 
the property of their respective owners, who may or may not be aﬃliated with, connected to, or 
sponsored by Amazon.
Amazon API Gateway
Developer Guide
Table of Contents
What is Amazon API Gateway? ....................................................................................................... 1
Architecture of API Gateway ...................................................................................................................... 2
Features of API Gateway ............................................................................................................................. 2
API Gateway use cases ................................................................................................................................ 3
Use API Gateway to create REST APIs ................................................................................................ 3
Use API Gateway to create HTTP APIs ............................................................................................... 4
Use API Gateway to create WebSocket APIs ..................................................................................... 5
Who uses API Gateway? ........................................................................................................................ 5

API Gateway use cases ................................................................................................................................ 3
Use API Gateway to create REST APIs ................................................................................................ 3
Use API Gateway to create HTTP APIs ............................................................................................... 4
Use API Gateway to create WebSocket APIs ..................................................................................... 5
Who uses API Gateway? ........................................................................................................................ 5
Accessing API Gateway ................................................................................................................................ 6
Part of AWS serverless infrastructure ...................................................................................................... 7
How to get started with Amazon API Gateway ..................................................................................... 7
API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14

API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14
API management .................................................................................................................................. 15
Development .......................................................................................................................................... 15
Monitoring .............................................................................................................................................. 16
Integrations ............................................................................................................................................ 17
Get started with the REST API console ................................................................................................. 17
Step 1: Create a Lambda function .................................................................................................... 18
Step 2: Create a REST API .................................................................................................................. 19
Step 3: Create a Lambda proxy integration .................................................................................... 19

For Choose a VPC link version, select VPC link V2.
For Name, enter private-integrations-tutorial.
For VPC, choose the VPC that you created in step 1. The name should start with RestApiStack.
For Subnets, select the two private subnets in your VPC. Their names end with
PrivateSubnet.
Tutorial: Create a REST API with a private integration
Amazon API Gateway
Developer Guide
For Security groups, select the Group ID that starts with private-integrations-
tutorial and has the description of RestApiStack/RestApiTutorialService/
Service/SecurityGroup.
Choose Create.
After you create your VPC link V2, API Gateway provisions Elastic Network Interfaces to access your 
VPC. The process can take a few minutes. In the meantime, you can create your API.
Step 3: Create a REST API
The REST API provides an HTTP endpoint for your Amazon ECS service.
To create a REST API
Sign in to the API Gateway console at 
Choose Create API, and then for REST API, choose Build.
For Name, enter private-integration-api.
For IP address type, select IPv4.
Choose Create API.
After you create your API, you create a method.
Choose Create method, and then do the following:
a.
For Method type, select GET.
b.
For Integration type, select VPC link.
c.
Turn on VPC proxy integration.
d.
For HTTP method, select GET.
e.
For VPC link, choose the VPC link V2 you created in the previous step.
f.
For Integration target, enter the load balancer that you created with the CloudFormation 
template in Step 1. It's name should start with rest-.
g.
For Endpoint URL, enter 
The URL is used to set the Host header of the integration request. In this case, the host 
header is private-integrations-tutorial.
h.
Choose Create method.
Tutorial: Create a REST API with a private integration
Amazon API Gateway
Developer Guide
With the proxy integration, the API is ready to test.
Step 4: Test your API
Next, you test invoking the API method.
To test your API
Sign in to the API Gateway console at 
Choose your API.

To learn more, see the section called “Choose between REST APIs and HTTP APIs ”.
Use API Gateway to create WebSocket APIs
In a WebSocket API, the client and the server can both send messages to each other at any 
time. Backend servers can easily push data to connected users and devices, avoiding the need to 
implement complex polling mechanisms.
For example, you could build a serverless application using an API Gateway WebSocket API and 
AWS Lambda to send and receive messages to and from individual users or groups of users in a 
chat room. Or you could invoke backend services such as AWS Lambda, Amazon Kinesis, or an HTTP 
endpoint based on message content.
You can use API Gateway WebSocket APIs to build secure, real-time communication applications 
without having to provision or manage any servers to manage connections or large-scale data 
exchanges. Targeted use cases include real-time applications such as the following:
• Chat applications
• Real-time dashboards such as stock tickers
• Real-time alerts and notiﬁcations
API Gateway provides WebSocket API management functionality such as the following:
• Monitoring and throttling of connections and messages
• Using AWS X-Ray to trace messages as they travel through the APIs to backend services
• Easy integration with HTTP/HTTPS endpoints
Who uses API Gateway?
There are two kinds of developers who use API Gateway: API developers and app developers.
An API developer creates and deploys an API to enable the required functionality in API Gateway. 
The API developer must be a user in the AWS account that owns the API.
An app developer builds a functioning application to call AWS services by invoking a WebSocket or 
REST API created by an API developer in API Gateway.
Use API Gateway to create WebSocket APIs
Amazon API Gateway
Developer Guide
The app developer is the customer of the API developer. The app developer doesn't need to
`

**Generated Answer (Response):**
> 

This question is not directly addressed in the provided context, which is a developer guide for Amazon API Gateway. The context primarily focuses on creating REST APIs, HTTP APIs, and WebSocket APIs using API Gateway, and does not specifically discuss edge-optimized API endpoints, CloudFront distributions, or Point of Presence (POP) routing.

However, as an AWS Cloud Architect, I can provide a general answer to this question.

To design the integration request and response for an edge-optimized WebSocket API endpoint deployed to a specific Region using a CloudFront distribution, you would need to consider the following:

1. **Use a regional API Gateway endpoint**: Create a regional API Gateway endpoint in the Region where your CloudFront distribution is deployed. This will ensure that WebSocket API route requests from geographically diverse clients are routed to the nearest CloudFront POP.
2. **Use a CloudFront distribution with a WebSocket-enabled origin**: Configure your CloudFront distribution to use a WebSocket-enabled origin, such as an API Gateway WebSocket API. This will allow CloudFront to route WebSocket requests to the nearest POP.
3. **Use a callback URL with a regional domain name**: When sending messages to the client from the backend system, use a callback URL with a regional domain name that is routed through the CloudFront distribution. This will ensure that the callback URL is resolved to the nearest POP, allowing the client to receive messages from the backend system.
4. **Implement latency-based routing**: Use CloudFront's latency-based routing feature to route WebSocket API requests to the nearest POP based on the client's location. This will help reduce latency and improve the overall user experience.
5. **Monitor and optimize**: Monitor your WebSocket API's performance and optimize the integration request and response as needed to ensure that it meets your application's requirements.

By following these design principles, you can ensure that your edge-optimized WebSocket API endpoint is routed to the nearest CloudFront POP, while maintaining the correct callback URL for sending messages to the client from the backend system.

**Scores:** Faithfulness: 0 | Relevance: 0 | Context Accuracy: 0

---

## Question 41
**Query:** What is the minimum number of API Gateway integration configuration elements that must be specified in an OpenAPI definition to enable TLS termination with a custom compression size, while also supporting request and response templating, parameter mapping, and policy-based access control?

**Ground Truth:**
> At least 7 elements: x-amazon-apigateway-integration.requestTemplates, x-amazon-apigateway-integration.requestParameters, x-amazon-apigateway-integration.responses, x-amazon-apigateway-integration.responseTemplates, x-amazon-apigateway-integration.responseParameters, x-amazon-apigateway-integration.tlsConfig, and x-amazon-apigateway-minimum-compression-size.

**Retrieved Context (Proof):**
`	ext
Developer Guide
Amazon API Gateway
Copyright © 2026 Amazon Web Services, Inc. and/or its aﬃliates. All rights reserved.
Amazon API Gateway
Developer Guide
Amazon API Gateway: Developer Guide
Copyright © 2026 Amazon Web Services, Inc. and/or its aﬃliates. All rights reserved.
Amazon's trademarks and trade dress may not be used in connection with any product or service 
that is not Amazon's, in any manner that is likely to cause confusion among customers, or in any 
manner that disparages or discredits Amazon. All other trademarks not owned by Amazon are 
the property of their respective owners, who may or may not be aﬃliated with, connected to, or 
sponsored by Amazon.
Amazon API Gateway
Developer Guide
Table of Contents
What is Amazon API Gateway? ....................................................................................................... 1
Architecture of API Gateway ...................................................................................................................... 2
Features of API Gateway ............................................................................................................................. 2
API Gateway use cases ................................................................................................................................ 3
Use API Gateway to create REST APIs ................................................................................................ 3
Use API Gateway to create HTTP APIs ............................................................................................... 4
Use API Gateway to create WebSocket APIs ..................................................................................... 5
Who uses API Gateway? ........................................................................................................................ 5

API Gateway use cases ................................................................................................................................ 3
Use API Gateway to create REST APIs ................................................................................................ 3
Use API Gateway to create HTTP APIs ............................................................................................... 4
Use API Gateway to create WebSocket APIs ..................................................................................... 5
Who uses API Gateway? ........................................................................................................................ 5
Accessing API Gateway ................................................................................................................................ 6
Part of AWS serverless infrastructure ...................................................................................................... 7
How to get started with Amazon API Gateway ..................................................................................... 7
API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14

API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14
API management .................................................................................................................................. 15
Development .......................................................................................................................................... 15
Monitoring .............................................................................................................................................. 16
Integrations ............................................................................................................................................ 17
Get started with the REST API console ................................................................................................. 17
Step 1: Create a Lambda function .................................................................................................... 18
Step 2: Create a REST API .................................................................................................................. 19
Step 3: Create a Lambda proxy integration .................................................................................... 19

Usage plans .......................................................................................................................................... 859
API documentation ............................................................................................................................. 886
SDK generation ................................................................................................................................... 949
Sell your APIs as SaaS ....................................................................................................................... 976
Protect ........................................................................................................................................................ 980
Mutual TLS ........................................................................................................................................... 981
Client certiﬁcates ................................................................................................................................ 988
AWS WAF ........................................................................................................................................... 1028
Throttling ........................................................................................................................................... 1031
Private REST APIs ............................................................................................................................. 1034
Monitor .................................................................................................................................................... 1090
CloudWatch metrics ......................................................................................................................... 1091
CloudWatch logs .............................................................................................................................. 1099

mechanism enacted on the API. To test the API execution in real time, you must deploy the API 
ﬁrst. To deploy an API, you create a stage to create a snapshot of the API at that time. The stage 
name also deﬁnes the base path after the API's default host name. The API's root resource is 
appended after the stage name. When you modify the API, you must redeploy it to a new or 
existing stage before the changes take eﬀect.
To deploy the API to a stage
Choose Deploy API.
For Stage, select New stage.
For Stage name, enter test.
Note
The input must be UTF-8 encoded (i.e., unlocalized) text.
(Optional) For Description, enter a description.
Choose Deploy.
Under Stage details, choose the copy icon to copy your API's invoke URL. The general pattern of 
the API's base URL is  For example, the 
base URL of the API (beags1mnid) created in the us-west-2 region and deployed to the test
stage is 
Test the API in a deployment stage
There are several ways you can test a deployed API. For GET requests using only URL path variables 
or query string parameters, you can enter the API resource URL in a browser. For other methods, 
you must use more advanced REST API testing utilities, such as POSTMAN or cURL.
Choose a Lambda integration tutorial
Amazon API Gateway
Developer Guide
To test the API using cURL
Open a terminal window on your local computer connected to the internet.
To test POST /Seattle?time=evening:
Copy the following cURL command and paste it into the terminal window.
curl -v -X POST \ 
  '
time=evening' \ 
  -H 'content-type: application/json' \ 
  -H 'day: Thursday' \ 
  -H 'x-amz-docs-region: us-west-2' \ 
  -d '{ 
 "callerName": "John"
}'
You should get a successful response with the following payload:
{"greeting":"Good evening, John of Seattle. Happy Thursday!"}
If you change POST to PUT in this method request, you get the same response.
Clean up
If you no longer need the Lambda functions you created for this walkthrough, you can delete them
`

**Generated Answer (Response):**
> 

The provided context does not explicitly mention the minimum number of API Gateway integration configuration elements required to enable TLS termination with a custom compression size, while also supporting request and response templating, parameter mapping, and policy-based access control.

However, based on the context, we can infer that the following elements might be required:

1. Security: To enable TLS termination, you need to specify the security configuration, including the custom compression size.
2. Integration: To support request and response templating, you need to specify an integration configuration, such as a Lambda function or an HTTP backend.
3. RequestTemplates: To support request templating, you need to specify a RequestTemplates configuration.
4. ResponseTemplates: To support response templating, you need to specify a ResponseTemplates configuration.
5. RequestParameters: To support parameter mapping, you need to specify a RequestParameters configuration.
6. MethodSettings: To support policy-based access control, you need to specify a MethodSettings configuration, including the authorization and access control settings.

Therefore, the minimum number of API Gateway integration configuration elements that must be specified in an OpenAPI definition is at least 6. However, this is an educated guess based on the context, and the actual number of required elements might be more or less depending on the specific use case and requirements.

**Scores:** Faithfulness: 0 | Relevance: 1 | Context Accuracy: 1

---

## Question 42
**Query:** What is the primary purpose of using a request validator in the ANY method of the /{city} resource, and how does it impact the caching behavior of the API Gateway, considering the specific configuration of the URL query string parameters and HTTP request headers?

**Ground Truth:**
> The primary purpose of using a request validator is to ensure that all required data is defined, in this case, the 'time' query string parameter and the 'day' HTTP request header. This validation does not impact the caching behavior of the API Gateway, as caching is explicitly turned off for both the query string parameter and the HTTP request header.

**Retrieved Context (Proof):**
`	ext
Developer Guide
Amazon API Gateway
Copyright © 2026 Amazon Web Services, Inc. and/or its aﬃliates. All rights reserved.
Amazon API Gateway
Developer Guide
Amazon API Gateway: Developer Guide
Copyright © 2026 Amazon Web Services, Inc. and/or its aﬃliates. All rights reserved.
Amazon's trademarks and trade dress may not be used in connection with any product or service 
that is not Amazon's, in any manner that is likely to cause confusion among customers, or in any 
manner that disparages or discredits Amazon. All other trademarks not owned by Amazon are 
the property of their respective owners, who may or may not be aﬃliated with, connected to, or 
sponsored by Amazon.
Amazon API Gateway
Developer Guide
Table of Contents
What is Amazon API Gateway? ....................................................................................................... 1
Architecture of API Gateway ...................................................................................................................... 2
Features of API Gateway ............................................................................................................................. 2
API Gateway use cases ................................................................................................................................ 3
Use API Gateway to create REST APIs ................................................................................................ 3
Use API Gateway to create HTTP APIs ............................................................................................... 4
Use API Gateway to create WebSocket APIs ..................................................................................... 5
Who uses API Gateway? ........................................................................................................................ 5

API Gateway use cases ................................................................................................................................ 3
Use API Gateway to create REST APIs ................................................................................................ 3
Use API Gateway to create HTTP APIs ............................................................................................... 4
Use API Gateway to create WebSocket APIs ..................................................................................... 5
Who uses API Gateway? ........................................................................................................................ 5
Accessing API Gateway ................................................................................................................................ 6
Part of AWS serverless infrastructure ...................................................................................................... 7
How to get started with Amazon API Gateway ..................................................................................... 7
API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14

API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14
API management .................................................................................................................................. 15
Development .......................................................................................................................................... 15
Monitoring .............................................................................................................................................. 16
Integrations ............................................................................................................................................ 17
Get started with the REST API console ................................................................................................. 17
Step 1: Create a Lambda function .................................................................................................... 18
Step 2: Create a REST API .................................................................................................................. 19
Step 3: Create a Lambda proxy integration .................................................................................... 19

An API developer works with the API Gateway service component for API management, named
apigateway, to create, conﬁgure, and deploy an API.
As an API developer, you can create and manage an API by using the API Gateway console, 
described in Get started with API Gateway, or by calling the API references. There are several ways 
to call this API. They include using the AWS Command Line Interface (AWS CLI), or by using an AWS 
SDK. In addition, you can enable API creation with AWS CloudFormation templates or (in the case 
of REST APIs and HTTP APIs) OpenAPI extensions for API Gateway.
For a list of Regions where API Gateway is available, as well as the associated control service 
endpoints, see Amazon API Gateway Endpoints and Quotas.
Calling an API Gateway API
An app developer works with the API Gateway service component for API execution, named
execute-api, to invoke an API that was created or deployed in API Gateway. The underlying 
programming entities are exposed by the created API. There are several ways to call such an API. To 
learn more, see Invoke REST APIs in API Gateway and Invoke WebSocket APIs.
Accessing API Gateway
You can access Amazon API Gateway in the following ways:
• AWS Management Console – The AWS Management Console provides a web interface for 
creating and managing APIs. After you complete the steps in Prerequisites, you can access the API 
Gateway console at 
• AWS SDKs – If you're using a programming language that AWS provides an SDK for, you can 
use an SDK to access API Gateway. SDKs simplify authentication, integrate easily with your 
development environment, and provide access to API Gateway commands. For more information, 
see Tools for Amazon Web Services.
Accessing API Gateway
Amazon API Gateway
Developer Guide
• API Gateway V1 and V2 APIs – If you're using a programming language that an SDK isn't 
available for, see the Amazon API Gateway Version 1 API Reference and Amazon API Gateway 
Version 2 API Reference.

Authorization options
REST API
HTTP API
IAM
 Yes
 Yes
Resource policies
 Yes
 No
Amazon Cognito
 Yes
 Yes 1
Security
Amazon API Gateway
Developer Guide
Authorization options
REST API
HTTP API
Custom authorization with an 
AWS Lambda function
 Yes
 Yes
JSON Web Token (JWT) 2
 No
 Yes
1 You can use Amazon Cognito with a JWT authorizer.
2 You can use a Lambda authorizer to validate JWTs for REST APIs.
API management
Choose REST APIs if you need API management capabilities such as API keys and per-client rate 
limiting. For more information, see the section called “Distribute”, the section called “Custom 
domain names”, and the section called “Custom domain names”.
Features
REST API
HTTP API
Custom domains
 Yes
 Yes
API keys
 Yes
 No
Per-client rate limiting
 Yes
 No
Per-client usage throttling
 Yes
 No
Developer portal
 Yes
 No
Development
As you're developing your API Gateway API, you decide on a number of characteristics of your API. 
These characteristics depend on the use case of your API. For more information see the section 
called “Develop” and the section called “Develop”.
Features
REST API
HTTP API
CORS conﬁguration
 Yes
 Yes
API management
Amazon API Gateway
Developer Guide
Features
REST API
HTTP API
Test invocations
 Yes
 No
Caching
 Yes
 No
User-controlled deployments
 Yes
 Yes
Automatic deployments
 No
 Yes
Custom gateway responses
 Yes
 No
Canary release deployments
 Yes
 No
Request validation
 Yes
 No
Request parameter transform 
ation
 Yes
 Yes
Request body transformation
 Yes
 No
Monitoring
API Gateway supports several options to log API requests and monitor your APIs. For more 
information, see the section called “Monitor” and the section called “Monitor”.
Feature
REST API
HTTP API
Amazon CloudWatch metrics
 Yes
 Yes
Access logs to CloudWatch 
Logs
 Yes
 Yes
Access logs to Amazon Data 
Firehose
 Yes
 No
Execution logs
 Yes
 No
AWS X-Ray tracing
 Yes
 No
Monitoring
Amazon API Gateway
Developer Guide
Integrations
`

**Generated Answer (Response):**
> 

The primary purpose of using a request validator in the ANY method of the /{city} resource is to ensure that the incoming request meets the expected format and structure. This includes validating the URL query string parameters and HTTP request headers.

When a request validator is enabled, API Gateway will validate the incoming request against the defined schema before invoking the backend integration. If the request is invalid, API Gateway will return an error response to the client without invoking the backend.

Regarding caching behavior, when a request validator is enabled, API Gateway will cache the validation result for a specific amount of time. This means that if the same request is sent again within the caching period, API Gateway will return the cached validation result instead of re-validating the request.

In the context of the ANY method of the /{city} resource, the request validator will impact the caching behavior as follows:

* If the request validator is configured to validate the URL query string parameters, API Gateway will cache the validation result based on the query string parameters. This means that if the same query string parameters are sent again, API Gateway will return the cached validation result.
* If the request validator is configured to validate the HTTP request headers, API Gateway will cache the validation result based on the request headers. This means that if the same request headers are sent again, API Gateway will return the cached validation result.

In summary, the request validator ensures that the incoming request meets the expected format and structure, and its caching behavior is influenced by the specific configuration of the URL query string parameters and HTTP request headers.

**Scores:** Faithfulness: 1 | Relevance: 1 | Context Accuracy: 1

---

## Question 43
**Query:** What is the key difference between Lambda proxy integration and Lambda non-proxy integration in Amazon API Gateway, and how does this difference impact the way the input to the Lambda function is expressed and the evolution of the API method?

**Ground Truth:**
> The key difference is that in Lambda proxy integration, the input to the Lambda function can be expressed as any combination of request headers, path variables, query string parameters, body, and API configuration data, and API Gateway configures the integration request and integration response, whereas in Lambda non-proxy integration, the input to the Lambda function must be supplied explicitly. This difference impacts the way the API method evolves, as Lambda proxy integration allows the API method to evolve without modifying the existing settings, whereas Lambda non-proxy integration requires explicit input configuration.

**Retrieved Context (Proof):**
`	ext
Developer Guide
Amazon API Gateway
Copyright © 2026 Amazon Web Services, Inc. and/or its aﬃliates. All rights reserved.
Amazon API Gateway
Developer Guide
Amazon API Gateway: Developer Guide
Copyright © 2026 Amazon Web Services, Inc. and/or its aﬃliates. All rights reserved.
Amazon's trademarks and trade dress may not be used in connection with any product or service 
that is not Amazon's, in any manner that is likely to cause confusion among customers, or in any 
manner that disparages or discredits Amazon. All other trademarks not owned by Amazon are 
the property of their respective owners, who may or may not be aﬃliated with, connected to, or 
sponsored by Amazon.
Amazon API Gateway
Developer Guide
Table of Contents
What is Amazon API Gateway? ....................................................................................................... 1
Architecture of API Gateway ...................................................................................................................... 2
Features of API Gateway ............................................................................................................................. 2
API Gateway use cases ................................................................................................................................ 3
Use API Gateway to create REST APIs ................................................................................................ 3
Use API Gateway to create HTTP APIs ............................................................................................... 4
Use API Gateway to create WebSocket APIs ..................................................................................... 5
Who uses API Gateway? ........................................................................................................................ 5

API Gateway use cases ................................................................................................................................ 3
Use API Gateway to create REST APIs ................................................................................................ 3
Use API Gateway to create HTTP APIs ............................................................................................... 4
Use API Gateway to create WebSocket APIs ..................................................................................... 5
Who uses API Gateway? ........................................................................................................................ 5
Accessing API Gateway ................................................................................................................................ 6
Part of AWS serverless infrastructure ...................................................................................................... 7
How to get started with Amazon API Gateway ..................................................................................... 7
API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14

API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14
API management .................................................................................................................................. 15
Development .......................................................................................................................................... 15
Monitoring .............................................................................................................................................. 16
Integrations ............................................................................................................................................ 17
Get started with the REST API console ................................................................................................. 17
Step 1: Create a Lambda function .................................................................................................... 18
Step 2: Create a REST API .................................................................................................................. 19
Step 3: Create a Lambda proxy integration .................................................................................... 19

Choose an AWS Lambda integration tutorial
To build an API with Lambda integrations, you can use Lambda proxy integration or Lambda non-
proxy integration.
In Lambda proxy integration, the input to the Lambda function can be expressed as any 
combination of request headers, path variables, query string parameters, body, and API 
conﬁguration data. You only need to choose a Lambda function. API Gateway conﬁgures the 
integration request and integration response for you. Once set up, your API method can evolve 
without modifying the existing settings. This is possible because the backend Lambda function 
parses the incoming request data and responds to the client.
In Lambda non-proxy integration, you must ensure that input to the Lambda function is supplied 
as the integration request payload. You must map any input data the client supplied as request 
REST API tutorials
Amazon API Gateway
Developer Guide
parameters into the proper integration request body. You might also need to translate the client-
supplied request body into a format recognized by the Lambda function.
In either a Lambda proxy or a Lambda non-proxy integration, you can use a Lambda function in a 
diﬀerent account from the account where you created your API.
Topics
• Tutorial: Create a REST API with a Lambda proxy integration
• Tutorial: Create a REST API with a Lambda non-proxy integration
• Tutorial: Create a REST API with a cross-account Lambda proxy integration
Tutorial: Create a REST API with a Lambda proxy integration
Lambda proxy integration is a lightweight, ﬂexible API Gateway API integration type that allows 
you to integrate an API method – or an entire API – with a Lambda function. The Lambda function 
can be written in any language that Lambda supports. Because it's a proxy integration, you can 
change the Lambda function implementation at any time without needing to redeploy your API.
In this tutorial, you do the following:

diﬀerent account from the account where you created your API.
Topics
• Tutorial: Create a REST API with a Lambda proxy integration
• Tutorial: Create a REST API with a Lambda non-proxy integration
• Tutorial: Create a REST API with a cross-account Lambda proxy integration
Tutorial: Create a REST API with a Lambda proxy integration
Lambda proxy integration is a lightweight, ﬂexible API Gateway API integration type that allows 
you to integrate an API method – or an entire API – with a Lambda function. The Lambda function 
can be written in any language that Lambda supports. Because it's a proxy integration, you can 
change the Lambda function implementation at any time without needing to redeploy your API.
In this tutorial, you do the following:
• Create a "Hello, World!" Lambda function to be the backend for the API.
• Create and test a "Hello, World!" API with Lambda proxy integration.
Topics
• Create a "Hello, World!" Lambda function
• Create a "Hello, World!" API
• Deploy and test the API
Create a "Hello, World!" Lambda function
To create a "Hello, World!" Lambda function in the Lambda console
Sign in to the Lambda console at 
On the AWS navigation bar, choose an AWS Region.
Choose a Lambda integration tutorial
Amazon API Gateway
Developer Guide
Note
Note the region where you create the Lambda function. You'll need it when you create 
the API.
Choose Functions in the navigation pane.
Choose Create function.
Choose Author from scratch.
Under Basic information, do the following:
a.
In Function name, enter GetStartedLambdaProxyIntegration.
b.
For Runtime, choose either the latest supported Node.js or Python runtime.
c.
For Architecture, keep the default setting.
d.
Under Permissions, expand Change default execution role. For Execution role dropdown 
list, choose Create new role from AWS policy templates.
e.
In Role name, enter GetStartedLambdaBasicExecutionRole.
f.
Leave the Policy templates ﬁeld blank.
g.
Choose Create function.
`

**Generated Answer (Response):**
> 

The key difference between Lambda proxy integration and Lambda non-proxy integration in Amazon API Gateway is how the input to the Lambda function is expressed and handled.

In Lambda proxy integration, the input to the Lambda function can be expressed as any combination of request headers, path variables, query string parameters, body, and API configuration data. API Gateway configures the integration request and integration response for you, allowing the backend Lambda function to parse the incoming request data and respond to the client. This means that the API method can evolve without modifying the existing settings.

In contrast, in Lambda non-proxy integration, you must ensure that the input to the Lambda function is supplied as the integration request payload. You must map any input data the client supplied as request parameters into the proper integration request body, and you might also need to translate the client-supplied request body into a format recognized by the Lambda function.

This difference impacts the way the input to the Lambda function is expressed and the evolution of the API method in the following ways:

* In Lambda proxy integration, the input to the Lambda function is more flexible and can be expressed in a variety of ways, allowing for easier changes to the API method without modifying the existing settings.
* In Lambda non-proxy integration, the input to the Lambda function is more rigid and requires explicit mapping and translation of input data, making it more difficult to evolve the API method without modifying the existing settings.

Overall, Lambda proxy integration provides a more lightweight and flexible way to integrate an API method with a Lambda function, while Lambda non-proxy integration requires more explicit configuration and mapping of input data.

**Scores:** Faithfulness: 1 | Relevance: 1 | Context Accuracy: 1

---

## Question 44
**Query:** What is the primary difference between using AWS CloudFormation and AWS SAM to automate the creation and cleanup of AWS resources, specifically in the context of API Gateway, and how would you choose between the two approaches for a serverless API deployment?

**Ground Truth:**
> AWS CloudFormation is a general-purpose infrastructure as code (IaC) service that allows you to model and set up your AWS resources, whereas AWS SAM is a specific framework that provides a simplified way to build serverless applications, including API Gateway, Lambda functions, and other resources. The primary difference is that CloudFormation provides more flexibility and control over resource creation and management, whereas SAM provides a more streamlined and opinionated approach to building serverless applications. When choosing between the two, consider the complexity and customization requirements of your API Gateway deployment; if you need fine-grained control over resource creation and management, CloudFormation may be a better choice, whereas if you want a more streamlined and simplified approach to building a serverless API, SAM may be a better fit.

**Retrieved Context (Proof):**
`	ext
Developer Guide
Amazon API Gateway
Copyright © 2026 Amazon Web Services, Inc. and/or its aﬃliates. All rights reserved.
Amazon API Gateway
Developer Guide
Amazon API Gateway: Developer Guide
Copyright © 2026 Amazon Web Services, Inc. and/or its aﬃliates. All rights reserved.
Amazon's trademarks and trade dress may not be used in connection with any product or service 
that is not Amazon's, in any manner that is likely to cause confusion among customers, or in any 
manner that disparages or discredits Amazon. All other trademarks not owned by Amazon are 
the property of their respective owners, who may or may not be aﬃliated with, connected to, or 
sponsored by Amazon.
Amazon API Gateway
Developer Guide
Table of Contents
What is Amazon API Gateway? ....................................................................................................... 1
Architecture of API Gateway ...................................................................................................................... 2
Features of API Gateway ............................................................................................................................. 2
API Gateway use cases ................................................................................................................................ 3
Use API Gateway to create REST APIs ................................................................................................ 3
Use API Gateway to create HTTP APIs ............................................................................................... 4
Use API Gateway to create WebSocket APIs ..................................................................................... 5
Who uses API Gateway? ........................................................................................................................ 5

API Gateway use cases ................................................................................................................................ 3
Use API Gateway to create REST APIs ................................................................................................ 3
Use API Gateway to create HTTP APIs ............................................................................................... 4
Use API Gateway to create WebSocket APIs ..................................................................................... 5
Who uses API Gateway? ........................................................................................................................ 5
Accessing API Gateway ................................................................................................................................ 6
Part of AWS serverless infrastructure ...................................................................................................... 7
How to get started with Amazon API Gateway ..................................................................................... 7
API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14

API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14
API management .................................................................................................................................. 15
Development .......................................................................................................................................... 15
Monitoring .............................................................................................................................................. 16
Integrations ............................................................................................................................................ 17
Get started with the REST API console ................................................................................................. 17
Step 1: Create a Lambda function .................................................................................................... 18
Step 2: Create a REST API .................................................................................................................. 19
Step 3: Create a Lambda proxy integration .................................................................................... 19

as %2F instead of /. This template translates the %2F into '/' before passing it to the Lambda 
function.
To create a mapping template
On the Integration request tab, under Integration request settings, choose Edit.
For Request body passthrough, select When there are no templates deﬁned 
(recommended).
Choose Mapping templates.
For Content type, enter application/json.
For Template body, enter the following code:
{ 
   "a": "$input.params('operand1')", 
   "b": "$input.params('operand2')", 
   "op": 
 #if($input.params('operator')=='%2F')"/"#{else}"$input.params('operator')"#end
}
Choose Save.
Tutorial: Create a calculator REST API with three integrations
Amazon API Gateway
Developer Guide
You can now test your GET method to verify that it has been properly set up to invoke the Lambda 
function and pass the original output through the integration response without mapping.
To test the GET method
Choose the Test tab. You might need to choose the right arrow button to show the tab.
For the Path, do the following:
a.
For operand1, enter 1.
b.
For operand2, enter 1.
c.
For operator, enter +.
Choose Test.
The result should look like this:
Next, you model the data structure of the method response payload after the result schema.
By default, the method response body is assigned an empty model. This will cause the integration 
response body to be passed through without mapping. However, when you generate an SDK for 
one of the strongly-type languages, such as Java or Objective-C, your SDK users will receive an 
empty object as the result. To ensure that both the REST client and SDK clients receive the desired 
result, you must model the response data using a predeﬁned schema. Here you'll deﬁne a model 
for the method response body and to construct a mapping template to translate the integration 
response body into the method response body.
To create a method response
On the Method response tab, under Response 200, choose Edit.
Under Response body, choose Add model.

}, 
        { 
            "Effect": "Allow", 
            "Action": [ 
                "logs:CreateLogStream", 
                "logs:PutLogEvents" 
            ], 
            "Resource": [ 
                "arn:aws:logs:us-east-1:111111111111:log-group:/aws/lambda/
GetStartedLambdaIntegration:*" 
            ] 
        } 
    ]
}
The other policy document applies to invoking another AWS service that is not used in this 
example. You can skip it for now.
Associated with the IAM role is a trusted entity, which is lambda.amazonaws.com. Here is the 
trust relationship:
JSON
{ 
  "Version":"2012-10-17",        
  "Statement": [ 
    { 
      "Effect": "Allow", 
Choose a Lambda integration tutorial
Amazon API Gateway
Developer Guide
      "Principal": { 
        "Service": "lambda.amazonaws.com" 
      }, 
      "Action": "sts:AssumeRole" 
    } 
  ]
}
The combination of this trust relationship and the inline policy makes it possible for the Lambda 
function to invoke a console.log() function to log events to CloudWatch Logs.
Create an API with Lambda non-proxy integration
With the Lambda function (GetStartedLambdaIntegration) created and tested, you are ready 
to expose the function through an API Gateway API. For illustration purposes, we expose the 
Lambda function with a generic HTTP method. We use the request body, a URL path variable, 
a query string, and a header to receive required input data from the client. We turn on the API 
Gateway request validator for the API to ensure that all of the required data is properly deﬁned 
and speciﬁed. We conﬁgure a mapping template for API Gateway to transform the client-supplied 
request data into the valid format as required by the backend Lambda function.
To create an API with a Lambda non-proxy integration
Sign in to the API Gateway console at 
If this is your ﬁrst time using API Gateway, you see a page that introduces you to the features
`

**Generated Answer (Response):**
> 

The primary difference between using AWS CloudFormation and AWS SAM to automate the creation and cleanup of AWS resources, specifically in the context of API Gateway, lies in their design goals, syntax, and level of abstraction.

AWS CloudFormation is a general-purpose infrastructure-as-code (IaC) service that allows you to define and manage a wide range of AWS resources, including API Gateway, using templates written in YAML or JSON. CloudFormation provides a low-level, fine-grained control over resource creation and configuration, which can be beneficial for complex, custom infrastructure setups.

On the other hand, AWS SAM (Serverless Application Model) is an open-source framework specifically designed for building serverless applications, including those using API Gateway. SAM provides a higher-level abstraction and a more streamlined, simplified syntax for defining serverless resources, such as functions, APIs, and event sources. SAM templates are also written in YAML or JSON.

When choosing between AWS CloudFormation and AWS SAM for a serverless API deployment, consider the following factors:

1. **Complexity**: If your API Gateway setup requires intricate, custom configurations or integrates with multiple AWS services, CloudFormation might be a better fit. For simpler, more straightforward serverless API deployments, SAM's higher-level abstraction and streamlined syntax can be more suitable.
2. **Serverless focus**: Since SAM is specifically designed for serverless applications, it provides more built-in support for serverless resources and event-driven architectures. If your API is primarily serverless, SAM might be a more natural choice.
3. **Learning curve**: If your team is already familiar with CloudFormation, you might prefer to stick with it. However, if you're new to infrastructure-as-code or serverless development, SAM's simpler syntax and more focused feature set might be easier to learn and adopt.
4. **Integration with other AWS services**: If your API integrates with other AWS services, such as AWS Lambda, Amazon S3, or Amazon DynamoDB, SAM's built-in support for these services can simplify your deployment process.

In summary, if you need fine-grained control over API Gateway resource creation and configuration, or your API has complex, custom requirements, CloudFormation might be the better choice. For simpler, more straightforward serverless API deployments, SAM's higher-level abstraction and streamlined syntax can provide a more efficient and easier-to-use solution.

**Scores:** Faithfulness: 0 | Relevance: 1 | Context Accuracy: 1

---

## Question 45
**Query:** What is the primary purpose of the x-amazon-apigateway-security-policy header in Amazon API Gateway, and how does it relate to the identity and access management mechanisms described in the Developer Guide?

**Ground Truth:**
> The primary purpose of the x-amazon-apigateway-security-policy header is to specify the security policy for an API, which defines the set of rules that govern access to the API. This relates to identity and access management mechanisms, such as authenticating with identities, as the security policy can be used to enforce authentication and authorization requirements for API requests.

**Retrieved Context (Proof):**
`	ext
Developer Guide
Amazon API Gateway
Copyright © 2026 Amazon Web Services, Inc. and/or its aﬃliates. All rights reserved.
Amazon API Gateway
Developer Guide
Amazon API Gateway: Developer Guide
Copyright © 2026 Amazon Web Services, Inc. and/or its aﬃliates. All rights reserved.
Amazon's trademarks and trade dress may not be used in connection with any product or service 
that is not Amazon's, in any manner that is likely to cause confusion among customers, or in any 
manner that disparages or discredits Amazon. All other trademarks not owned by Amazon are 
the property of their respective owners, who may or may not be aﬃliated with, connected to, or 
sponsored by Amazon.
Amazon API Gateway
Developer Guide
Table of Contents
What is Amazon API Gateway? ....................................................................................................... 1
Architecture of API Gateway ...................................................................................................................... 2
Features of API Gateway ............................................................................................................................. 2
API Gateway use cases ................................................................................................................................ 3
Use API Gateway to create REST APIs ................................................................................................ 3
Use API Gateway to create HTTP APIs ............................................................................................... 4
Use API Gateway to create WebSocket APIs ..................................................................................... 5
Who uses API Gateway? ........................................................................................................................ 5

API Gateway use cases ................................................................................................................................ 3
Use API Gateway to create REST APIs ................................................................................................ 3
Use API Gateway to create HTTP APIs ............................................................................................... 4
Use API Gateway to create WebSocket APIs ..................................................................................... 5
Who uses API Gateway? ........................................................................................................................ 5
Accessing API Gateway ................................................................................................................................ 6
Part of AWS serverless infrastructure ...................................................................................................... 7
How to get started with Amazon API Gateway ..................................................................................... 7
API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14

API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14
API management .................................................................................................................................. 15
Development .......................................................................................................................................... 15
Monitoring .............................................................................................................................................. 16
Integrations ............................................................................................................................................ 17
Get started with the REST API console ................................................................................................. 17
Step 1: Create a Lambda function .................................................................................................... 18
Step 2: Create a REST API .................................................................................................................. 19
Step 3: Create a Lambda proxy integration .................................................................................... 19

Infrastructure security .......................................................................................................................... 1460
Conﬁguration and vulnerability analysis .......................................................................................... 1461
Best practices ......................................................................................................................................... 1461
Tagging ....................................................................................................................................... 1463
API Gateway resources that can be tagged ..................................................................................... 1463
Tag inheritance in the Amazon API Gateway V1 API ................................................................ 1465
Tag restrictions and usage conventions ...................................................................................... 1466
Attribute-based access control ........................................................................................................... 1466
Limit actions based on resource tags .......................................................................................... 1467
Allow actions based on resource tags ......................................................................................... 1468
Deny tagging operations ................................................................................................................ 1469
Allow tagging operations ............................................................................................................... 1470
API references ............................................................................................................................ 1471
API Gateway service endpoints .......................................................................................................... 1471

x-amazon-apigateway-request-validators example .................................................. 1417
x-amazon-apigateway-request-validators.requestValidator ......................................................... 1417
x-amazon-apigateway-request-validators.requestValidator example ......... 1418
x-amazon-apigateway-security-policy ............................................................................................... 1418
x-amazon-apigateway-security-policy example ......................................................... 1418
x-amazon-apigateway-tag-value ........................................................................................................ 1419
x-amazon-apigateway-tag-value example ....................................................................... 1419
Security ...................................................................................................................................... 1420
Data protection ...................................................................................................................................... 1421
Data encryption ................................................................................................................................ 1422
ix
Amazon API Gateway
Developer Guide
Internetwork traﬃc privacy ........................................................................................................... 1424
Identity and access management ...................................................................................................... 1424
Audience ............................................................................................................................................. 1425
Authenticating with identities ....................................................................................................... 1425
`

**Generated Answer (Response):**
> 

According to the Amazon API Gateway Developer Guide, the x-amazon-apigateway-security-policy header is used to specify a security policy for an API. This security policy is related to the identity and access management mechanisms described in the Developer Guide, as it is used to define the security settings for an API, such as authentication and authorization.

In the context of identity and access management, the x-amazon-apigateway-security-policy header is used to define the security policy for an API, which includes settings for authenticating and authorizing requests to the API. This policy is used to control access to the API and ensure that only authorized requests are processed.

In other words, the x-amazon-apigateway-security-policy header is used to define the security settings for an API, which are then used to authenticate and authorize requests to the API, as part of the identity and access management mechanisms described in the Developer Guide.

**Scores:** Faithfulness: 1 | Relevance: 1 | Context Accuracy: 1

---

## Question 46
**Query:** What is the recommended approach to access API Gateway if an SDK is not available for the programming language being used, and how does this approach differ from using AWS SDKs, AWS Command Line Interface, or AWS Tools for Windows PowerShell?

**Ground Truth:**
> If an SDK is not available for the programming language being used, the recommended approach is to use the API Gateway V1 and V2 APIs, which provide a RESTful interface to access API Gateway. This approach differs from using AWS SDKs, which simplify authentication and integrate easily with the development environment, and from using AWS Command Line Interface or AWS Tools for Windows PowerShell, which provide a command-line interface to access API Gateway.

**Retrieved Context (Proof):**
`	ext
Developer Guide
Amazon API Gateway
Copyright © 2026 Amazon Web Services, Inc. and/or its aﬃliates. All rights reserved.
Amazon API Gateway
Developer Guide
Amazon API Gateway: Developer Guide
Copyright © 2026 Amazon Web Services, Inc. and/or its aﬃliates. All rights reserved.
Amazon's trademarks and trade dress may not be used in connection with any product or service 
that is not Amazon's, in any manner that is likely to cause confusion among customers, or in any 
manner that disparages or discredits Amazon. All other trademarks not owned by Amazon are 
the property of their respective owners, who may or may not be aﬃliated with, connected to, or 
sponsored by Amazon.
Amazon API Gateway
Developer Guide
Table of Contents
What is Amazon API Gateway? ....................................................................................................... 1
Architecture of API Gateway ...................................................................................................................... 2
Features of API Gateway ............................................................................................................................. 2
API Gateway use cases ................................................................................................................................ 3
Use API Gateway to create REST APIs ................................................................................................ 3
Use API Gateway to create HTTP APIs ............................................................................................... 4
Use API Gateway to create WebSocket APIs ..................................................................................... 5
Who uses API Gateway? ........................................................................................................................ 5

API Gateway use cases ................................................................................................................................ 3
Use API Gateway to create REST APIs ................................................................................................ 3
Use API Gateway to create HTTP APIs ............................................................................................... 4
Use API Gateway to create WebSocket APIs ..................................................................................... 5
Who uses API Gateway? ........................................................................................................................ 5
Accessing API Gateway ................................................................................................................................ 6
Part of AWS serverless infrastructure ...................................................................................................... 7
How to get started with Amazon API Gateway ..................................................................................... 7
API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14

API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14
API management .................................................................................................................................. 15
Development .......................................................................................................................................... 15
Monitoring .............................................................................................................................................. 16
Integrations ............................................................................................................................................ 17
Get started with the REST API console ................................................................................................. 17
Step 1: Create a Lambda function .................................................................................................... 18
Step 2: Create a REST API .................................................................................................................. 19
Step 3: Create a Lambda proxy integration .................................................................................... 19

To create a Lambda function
Sign in to the Lambda console at 
Choose Create function.
For Function name, enter my-function.
For all other options, use the default setting.
Choose Create function.
The example function returns a 200 response to clients, and the text Hello from Lambda!.
You can modify your Lambda function, as long as the function's response aligns with the format 
that API Gateway requires.
The default Lambda function code should look similar to the following:
export const handler = async (event) => { 
    const response = { 
        statusCode: 200, 
        body: JSON.stringify('Hello from Lambda!'), 
    }; 
    return response;
};
Step 2: Create an HTTP API
Next, you create an HTTP API. API Gateway also supports REST APIs and WebSocket APIs, but an 
HTTP API is the best choice for this exercise. REST APIs support more features than HTTP APIs, but 
we don't need those features for this exercise. HTTP APIs are designed with minimal features so 
Step 1: Create a Lambda function
Amazon API Gateway
Developer Guide
that they can be oﬀered at a lower price. WebSocket APIs maintain persistent connections with 
clients for full-duplex communication, which isn't required for this example.
The HTTP API provides an HTTP endpoint for your Lambda function. API Gateway routes requests 
to your Lambda function, and then returns the function's response to clients.
To create an HTTP API
Sign in to the API Gateway console at 
Do one of the following:
•
To create your ﬁrst API, for HTTP API, choose Build.
•
If you've created an API before, choose Create API, and then choose Build for HTTP API.
For Integrations, choose Add integration.
Choose Lambda.
For Lambda function, enter my-function.
For API name, enter my-http-api.
Choose Next.
Review the route that API Gateway creates for you, and then choose Next.
Review the stage that API Gateway creates for you, and then choose Next.
10. Choose Create.

Amazon API Gateway
Developer Guide
Features
REST API
HTTP API
Test invocations
 Yes
 No
Caching
 Yes
 No
User-controlled deployments
 Yes
 Yes
Automatic deployments
 No
 Yes
Custom gateway responses
 Yes
 No
Canary release deployments
 Yes
 No
Request validation
 Yes
 No
Request parameter transform 
ation
 Yes
 Yes
Request body transformation
 Yes
 No
Monitoring
API Gateway supports several options to log API requests and monitor your APIs. For more 
information, see the section called “Monitor” and the section called “Monitor”.
Feature
REST API
HTTP API
Amazon CloudWatch metrics
 Yes
 Yes
Access logs to CloudWatch 
Logs
 Yes
 Yes
Access logs to Amazon Data 
Firehose
 Yes
 No
Execution logs
 Yes
 No
AWS X-Ray tracing
 Yes
 No
Monitoring
Amazon API Gateway
Developer Guide
Integrations
Integrations connect your API Gateway API to backend resources. For more information, see the 
section called “Integrations” and the section called “Integrations”.
Feature
REST API
HTTP API
Public HTTP endpoints
 Yes
 Yes
AWS services
 Yes
 Yes
AWS Lambda functions
 Yes
 Yes
Private integrations with 
Network Load Balancers
 Yes
 Yes
Private integrations with 
Application Load Balancers
 Yes
 Yes
Private integrations with AWS 
Cloud Map
 No
 Yes
Mock integrations
 Yes
 No
Response streaming
 Yes
 No
Get started with the REST API console
In this getting started exercise, you create a serverless REST API using the API Gateway REST 
API console. Serverless APIs let you focus on your applications instead of spending your time 
provisioning and managing servers. This exercise should take less than 20 minutes to complete, 
and is possible within the AWS Free Tier.
First, you create a Lambda function using the Lambda console. Next, you create a REST API using 
the API Gateway REST API console. Then, you create an API method and integrate it with a Lambda 
function using a Lambda proxy integration. Finally, you deploy and invoke your API.
Integrations
Amazon API Gateway
Developer Guide
`

**Generated Answer (Response):**
> 

The recommended approach to access API Gateway if an SDK is not available for the programming language being used is to use the REST API or HTTP API directly. This can be done by sending HTTP requests to the API Gateway endpoint.

This approach differs from using AWS SDKs, AWS Command Line Interface, or AWS Tools for Windows PowerShell in that it does not provide a higher-level abstraction and convenience layer on top of the API Gateway API. With SDKs, CLI, or PowerShell tools, you can use a more convenient and language-specific interface to interact with API Gateway, whereas when using the REST API or HTTP API directly, you need to handle the underlying HTTP requests and responses yourself.

For example, you would need to construct the HTTP request URL, set the required headers, and handle errors and responses manually. This approach requires more effort and expertise, but it provides a high degree of control and flexibility.

**Scores:** Faithfulness: 1 | Relevance: 1 | Context Accuracy: 1

---

## Question 47
**Query:** What is the integration type of the API Gateway endpoint that responds with an overview of the PetStore website, and how does it differ from the integration type of the endpoint that returns a page of available pets in the PetStore, considering the implications of CORS access via the OPTIONS method?

**Ground Truth:**
> The integration type of the API Gateway endpoint that responds with an overview of the PetStore website is MOCK, whereas the integration type of the endpoint that returns a page of available pets in the PetStore is HTTP. The MOCK integration type is used for the OPTIONS method to support CORS access, whereas the HTTP integration type is used for the GET /pets endpoint to integrate with the backend /pets resource.

**Retrieved Context (Proof):**
`	ext
Developer Guide
Amazon API Gateway
Copyright © 2026 Amazon Web Services, Inc. and/or its aﬃliates. All rights reserved.
Amazon API Gateway
Developer Guide
Amazon API Gateway: Developer Guide
Copyright © 2026 Amazon Web Services, Inc. and/or its aﬃliates. All rights reserved.
Amazon's trademarks and trade dress may not be used in connection with any product or service 
that is not Amazon's, in any manner that is likely to cause confusion among customers, or in any 
manner that disparages or discredits Amazon. All other trademarks not owned by Amazon are 
the property of their respective owners, who may or may not be aﬃliated with, connected to, or 
sponsored by Amazon.
Amazon API Gateway
Developer Guide
Table of Contents
What is Amazon API Gateway? ....................................................................................................... 1
Architecture of API Gateway ...................................................................................................................... 2
Features of API Gateway ............................................................................................................................. 2
API Gateway use cases ................................................................................................................................ 3
Use API Gateway to create REST APIs ................................................................................................ 3
Use API Gateway to create HTTP APIs ............................................................................................... 4
Use API Gateway to create WebSocket APIs ..................................................................................... 5
Who uses API Gateway? ........................................................................................................................ 5

API Gateway use cases ................................................................................................................................ 3
Use API Gateway to create REST APIs ................................................................................................ 3
Use API Gateway to create HTTP APIs ............................................................................................... 4
Use API Gateway to create WebSocket APIs ..................................................................................... 5
Who uses API Gateway? ........................................................................................................................ 5
Accessing API Gateway ................................................................................................................................ 6
Part of AWS serverless infrastructure ...................................................................................................... 7
How to get started with Amazon API Gateway ..................................................................................... 7
API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14

API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14
API management .................................................................................................................................. 15
Development .......................................................................................................................................... 15
Monitoring .............................................................................................................................................. 16
Integrations ............................................................................................................................................ 17
Get started with the REST API console ................................................................................................. 17
Step 1: Create a Lambda function .................................................................................................... 18
Step 2: Create a REST API .................................................................................................................. 19
Step 3: Create a Lambda proxy integration .................................................................................... 19

from your backend services, such as workloads running on Amazon Elastic Compute Cloud 
(Amazon EC2), code running on AWS Lambda, any web application, or real-time communication 
applications.
Features of API Gateway
Amazon API Gateway oﬀers features such as the following:
Architecture of API Gateway
Amazon API Gateway
Developer Guide
• Support for stateful (WebSocket) and stateless (HTTP and REST) APIs.
• Powerful, ﬂexible authentication mechanisms, such as AWS Identity and Access Management 
policies, Lambda authorizer functions, and Amazon Cognito user pools.
• Canary release deployments for safely rolling out changes.
• CloudTrail logging and monitoring of API usage and API changes.
• CloudWatch access logging and execution logging, including the ability to set alarms. For more 
information, see the section called “CloudWatch metrics” and the section called “Metrics”.
• Ability to use CloudFormation templates to enable API creation. For more information, see
Amazon API Gateway Resource Types Reference and Amazon API Gateway V2 Resource Types 
Reference.
• Support for custom domain names.
• Integration with AWS WAF for protecting your APIs against common web exploits.
• Integration with AWS X-Ray for understanding and triaging performance latencies.
For a complete list of API Gateway feature releases, see Document history.
API Gateway use cases
The following use cases section presents an overview of the diﬀerent types of API Gateway APIs 
and the diﬀerent kinds of developers who use API Gateway. For more detailed information about 
the diﬀerence between REST APIs and HTTP APIs, see the section called “Choose between REST 
APIs and HTTP APIs ”.
Topics
• Use API Gateway to create REST APIs
• Use API Gateway to create HTTP APIs
• Use API Gateway to create WebSocket APIs
• Who uses API Gateway?
Use API Gateway to create REST APIs
An API Gateway REST API is made up of resources and methods. A resource is a logical entity that

Amazon API Gateway
Developer Guide
Features
REST API
HTTP API
Test invocations
 Yes
 No
Caching
 Yes
 No
User-controlled deployments
 Yes
 Yes
Automatic deployments
 No
 Yes
Custom gateway responses
 Yes
 No
Canary release deployments
 Yes
 No
Request validation
 Yes
 No
Request parameter transform 
ation
 Yes
 Yes
Request body transformation
 Yes
 No
Monitoring
API Gateway supports several options to log API requests and monitor your APIs. For more 
information, see the section called “Monitor” and the section called “Monitor”.
Feature
REST API
HTTP API
Amazon CloudWatch metrics
 Yes
 Yes
Access logs to CloudWatch 
Logs
 Yes
 Yes
Access logs to Amazon Data 
Firehose
 Yes
 No
Execution logs
 Yes
 No
AWS X-Ray tracing
 Yes
 No
Monitoring
Amazon API Gateway
Developer Guide
Integrations
Integrations connect your API Gateway API to backend resources. For more information, see the 
section called “Integrations” and the section called “Integrations”.
Feature
REST API
HTTP API
Public HTTP endpoints
 Yes
 Yes
AWS services
 Yes
 Yes
AWS Lambda functions
 Yes
 Yes
Private integrations with 
Network Load Balancers
 Yes
 Yes
Private integrations with 
Application Load Balancers
 Yes
 Yes
Private integrations with AWS 
Cloud Map
 No
 Yes
Mock integrations
 Yes
 No
Response streaming
 Yes
 No
Get started with the REST API console
In this getting started exercise, you create a serverless REST API using the API Gateway REST 
API console. Serverless APIs let you focus on your applications instead of spending your time 
provisioning and managing servers. This exercise should take less than 20 minutes to complete, 
and is possible within the AWS Free Tier.
First, you create a Lambda function using the Lambda console. Next, you create a REST API using 
the API Gateway REST API console. Then, you create an API method and integrate it with a Lambda 
function using a Lambda proxy integration. Finally, you deploy and invoke your API.
Integrations
Amazon API Gateway
Developer Guide
`

**Generated Answer (Response):**
> 

Based on the provided context, there is no specific information about the PetStore website or its API endpoints. The context only provides general information about Amazon API Gateway, its features, and use cases.

However, I can provide a general answer based on API Gateway integrations. 

The integration type of the API Gateway endpoint that responds with an overview of the PetStore website could be a public HTTP endpoint or an AWS Lambda function, depending on how the backend service is implemented.

The integration type of the endpoint that returns a page of available pets in the PetStore could also be a public HTTP endpoint or an AWS Lambda function, depending on how the backend service is implemented.

Regarding CORS access via the OPTIONS method, API Gateway supports CORS (Cross-Origin Resource Sharing) to enable cross-origin requests. To enable CORS, you need to configure the API Gateway endpoint to return the necessary CORS headers in response to the OPTIONS method. This would allow web applications from different origins to access the API.

In terms of differences, the integration type of the endpoint that returns a page of available pets might require additional configuration for CORS access, such as specifying the allowed origins, methods, and headers, whereas the endpoint that responds with an overview of the PetStore website might not require CORS configuration if it's not accessed by web applications from different origins.

Please note that this is a general answer based on API Gateway integrations and CORS configuration. Without specific information about the PetStore API endpoints, it's difficult to provide a more detailed answer.

**Scores:** Faithfulness: 0 | Relevance: 0 | Context Accuracy: 1

---

## Question 48
**Query:** What is the expected HTTP response code and payload when a client sends a GET request to the API's invoke URL with a query parameter 'type=fish' after deploying the API to a stage named 'test' and associating it with an HTTP custom integration, assuming the backend PetStore website supports the specified operation?

**Ground Truth:**
> The expected HTTP response code is 200 OK, and the payload is a JSON object containing a list of pets that match the query parameter 'type=fish', similar to the response received when calling GET /petstore/pets/1.

**Retrieved Context (Proof):**
`	ext
Developer Guide
Amazon API Gateway
Copyright © 2026 Amazon Web Services, Inc. and/or its aﬃliates. All rights reserved.
Amazon API Gateway
Developer Guide
Amazon API Gateway: Developer Guide
Copyright © 2026 Amazon Web Services, Inc. and/or its aﬃliates. All rights reserved.
Amazon's trademarks and trade dress may not be used in connection with any product or service 
that is not Amazon's, in any manner that is likely to cause confusion among customers, or in any 
manner that disparages or discredits Amazon. All other trademarks not owned by Amazon are 
the property of their respective owners, who may or may not be aﬃliated with, connected to, or 
sponsored by Amazon.
Amazon API Gateway
Developer Guide
Table of Contents
What is Amazon API Gateway? ....................................................................................................... 1
Architecture of API Gateway ...................................................................................................................... 2
Features of API Gateway ............................................................................................................................. 2
API Gateway use cases ................................................................................................................................ 3
Use API Gateway to create REST APIs ................................................................................................ 3
Use API Gateway to create HTTP APIs ............................................................................................... 4
Use API Gateway to create WebSocket APIs ..................................................................................... 5
Who uses API Gateway? ........................................................................................................................ 5

API Gateway use cases ................................................................................................................................ 3
Use API Gateway to create REST APIs ................................................................................................ 3
Use API Gateway to create HTTP APIs ............................................................................................... 4
Use API Gateway to create WebSocket APIs ..................................................................................... 5
Who uses API Gateway? ........................................................................................................................ 5
Accessing API Gateway ................................................................................................................................ 6
Part of AWS serverless infrastructure ...................................................................................................... 7
How to get started with Amazon API Gateway ..................................................................................... 7
API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14

API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14
API management .................................................................................................................................. 15
Development .......................................................................................................................................... 15
Monitoring .............................................................................................................................................. 16
Integrations ............................................................................................................................................ 17
Get started with the REST API console ................................................................................................. 17
Step 1: Create a Lambda function .................................................................................................... 18
Step 2: Create a REST API .................................................................................................................. 19
Step 3: Create a Lambda proxy integration .................................................................................... 19

Developer Guide
Choose Create method.
You can see your updated policy for your function in the Lambda console.
(Optional) To see your updated policy
Sign in to the AWS Management Console and open the AWS Lambda console at https:// 
console.aws.amazon.com/lambda/.
Choose your Lambda function.
Choose Permissions.
You should see an Allow policy with a Condition clause in which the in the AWS:SourceArn
is the ARN for your API's GET method.
Tutorial: Create a REST API by importing an example
You can use the Amazon API Gateway console to create and test a simple REST API with the HTTP 
integration for a PetStore website. The API deﬁnition is preconﬁgured as a OpenAPI 2.0 ﬁle. After 
loading the API deﬁnition into API Gateway, you can use the API Gateway console to examine the 
API's basic structure or simply deploy and test the API.
The PetStore example API supports the following methods for a client to access the HTTP backend 
website of 
Note
This tutorial uses an HTTP endpoint as an example. When you create your own APIs, we 
recommend you use HTTPS endpoints for your HTTP integrations.
• GET /: for read access of the API's root resource that is not integrated with any backend 
endpoint. API Gateway responds with an overview of the PetStore website. This is an example of 
the MOCK integration type.
• GET /pets: for read access to the API's /pets resource that is integrated with the like-named 
backend /pets resource. The backend returns a page of available pets in the PetStore. This 
is an example of the HTTP integration type. The URL of the integration endpoint is http://
petstore-demo-endpoint.execute-api.com/petstore/pets.
Tutorial: Create a REST API by importing an example
Amazon API Gateway
Developer Guide
• POST /pets: for write access to the API's /pets resource that is integrated with the backend /
petstore/pets resource. Upon receiving a correct request, the backend adds the speciﬁed pet

For example, the PetStore API used here does not expose the /petstore resource. As such, you 
get a 404 Resource Not Found response containing the error message of Cannot GET /
petstore.
In addition, the client must be able to handle the output format of the backend in order to parse 
the result correctly. API Gateway does not mediate to facilitate interactions between the client and 
backend.
To test an API integrated with the PetStore website using HTTP proxy integration through the 
proxy resource
Select the Test tab. You might need to choose the right arrow button to show the tab.
For Method type, select GET.
For Path, under proxy, enter petstore/pets.
Choose an HTTP integration tutorial
Amazon API Gateway
Developer Guide
For Query strings, enter type=fish.
Choose Test.
Because the backend website supports the GET /petstore/pets?type=fish request, it 
returns a successful response similar to the following:
[ 
  { 
    "id": 1, 
    "type": "fish", 
    "price": 249.99 
  }, 
  { 
    "id": 2, 
    "type": "fish", 
    "price": 124.99 
  }, 
  { 
    "id": 3, 
    "type": "fish", 
    "price": 0.99 
  }
Choose an HTTP integration tutorial
Amazon API Gateway
Developer Guide
]
If you try to call GET /petstore, you get a 404 response with an error message of Cannot 
GET /petstore. This is because the backend does not support the speciﬁed operation. If 
you call GET /petstore/pets/1, you get a 200 OK response with the following payload, 
because the request is supported by the PetStore website.
{ 
  "id": 1, 
  "type": "dog", 
  "price": 249.99
}
You can also use a browser to test your API. Deploy your API and associate it to a stage to create 
your API's Invoke URL.
To deploy your API
Choose Deploy API.
For Stage, select New stage.
For Stage name, enter test.
(Optional) For Description, enter a description.
Choose Deploy.
Now clients can call your API.
To invoke your API
Sign in to the API Gateway console at 
Choose your API.
`

**Generated Answer (Response):**
> 

According to the tutorial, when a client sends a GET request to the API's invoke URL with a query parameter 'type=fish', the expected HTTP response code is 200 OK, and the payload is a JSON array of pet objects, similar to:

[
  { 
    "id": 1, 
    "type": "fish", 
    "price": 249.99 
  }, 
  { 
    "id": 2, 
    "type": "fish", 
    "price": 124.99 
  }, 
  { 
    "id": 3, 
    "type": "fish", 
    "price": 0.99 
  }
]

**Scores:** Faithfulness: 1 | Relevance: 1 | Context Accuracy: 1

---

## Question 49
**Query:** What is the correct sequence of events when a client sends a request to an API Gateway REST API method, assuming a mapping template is specified in the integration request and another mapping template is specified in the integration response, and the backend returns a response with a specific status code and payload?

**Ground Truth:**
> The correct sequence of events is: (1) the client sends a request to the API Gateway REST API method, (2) the request is routed to the nearest CloudFront Point of Presence (POP), (3) the method request is processed, (4) the integration request is triggered, (5) the mapping template specified in the integration request transforms the request body from the frontend data format to the backend data format, (6) the transformed request is sent to the backend, (7) the backend processes the request and returns a response with a specific status code and payload, (8) the integration response is triggered, (9) the mapping template specified in the integration response transforms the response body from the backend data format to the frontend data format, (10) the transformed response is returned to the client app through the API Gateway.

**Retrieved Context (Proof):**
`	ext
Integration has the following relationship: CONTAINS with Method

Integration has the following relationship: RELATES_TO with Lambda

Integration has the following relationship: USES with HTTP Method

Integration has the following relationship: USES with Credential

Integration has the following relationship: HAS with URI

Integration has the following relationship: HAS with Response Parameter

Integration has the following relationship: HAS with Request Parameter

x-amazon-apigateway-authorizer has the following relationship: RELATES_TO with Amazon API Gateway

x-amazon-apigateway-authorizer has the following relationship: RELATES_TO with Amazon API Gateway REST APIs

x-amazon-apigateway-authorizer has the following relationship: RELATES_TO with Amazon API Gateway HTTP APIs

x-amazon-apigateway-authtype has the following relationship: DEPENDS_ON with x-amazon-apigateway-authorizer

x-amazon-apigateway-binary-media-type has the following relationship: DEPENDS_ON with x-amazon-apigateway-authorizer

x-amazon-apigateway-documentation has the following relationship: DEPENDS_ON with x-amazon-apigateway-authorizer

x-amazon-apigateway-endpoint-access-mode has the following relationship: DEPENDS_ON with x-amazon-apigateway-authorizer

x-amazon-apigateway-endpoint-access-mode has the following relationship: RELATES_TO with Amazon API Gateway
`

**Generated Answer (Response):**
> 

Based on the provided context, here is the correct sequence of events:

1. The client sends a request to the API Gateway REST API method.
2. The API Gateway checks the authorizer (x-amazon-apigateway-authorizer) to authenticate and authorize the request.
3. If authorized, the API Gateway routes the request to the Integration.
4. The Integration uses the specified HTTP Method (USES relationship) to send the request to the backend (Lambda function, based on the RELATES_TO relationship).
5. The Integration applies the mapping template specified in the integration request to transform the request payload.
6. The Lambda function processes the request and returns a response with a specific status code and payload.
7. The Integration applies the mapping template specified in the integration response to transform the response payload.
8. The Integration returns the transformed response to the API Gateway.
9. The API Gateway returns the response to the client.

Note that the sequence assumes a successful authorization and processing of the request. If the authorization fails or the Lambda function returns an error, the sequence may differ.

**Scores:** Faithfulness: 1 | Relevance: 1 | Context Accuracy: 1

---

## Question 50
**Query:** What is the primary reason why the API Gateway API must be redeployed after making changes to the API, and how does this redeployment impact the request URL?

**Ground Truth:**
> The primary reason is to make the new or updated features available, and redeployment updates the invoke URL, which must be used again to invoke the API successfully.

**Retrieved Context (Proof):**
`	ext
Developer Guide
Amazon API Gateway
Copyright © 2026 Amazon Web Services, Inc. and/or its aﬃliates. All rights reserved.
Amazon API Gateway
Developer Guide
Amazon API Gateway: Developer Guide
Copyright © 2026 Amazon Web Services, Inc. and/or its aﬃliates. All rights reserved.
Amazon's trademarks and trade dress may not be used in connection with any product or service 
that is not Amazon's, in any manner that is likely to cause confusion among customers, or in any 
manner that disparages or discredits Amazon. All other trademarks not owned by Amazon are 
the property of their respective owners, who may or may not be aﬃliated with, connected to, or 
sponsored by Amazon.
Amazon API Gateway
Developer Guide
Table of Contents
What is Amazon API Gateway? ....................................................................................................... 1
Architecture of API Gateway ...................................................................................................................... 2
Features of API Gateway ............................................................................................................................. 2
API Gateway use cases ................................................................................................................................ 3
Use API Gateway to create REST APIs ................................................................................................ 3
Use API Gateway to create HTTP APIs ............................................................................................... 4
Use API Gateway to create WebSocket APIs ..................................................................................... 5
Who uses API Gateway? ........................................................................................................................ 5

API Gateway use cases ................................................................................................................................ 3
Use API Gateway to create REST APIs ................................................................................................ 3
Use API Gateway to create HTTP APIs ............................................................................................... 4
Use API Gateway to create WebSocket APIs ..................................................................................... 5
Who uses API Gateway? ........................................................................................................................ 5
Accessing API Gateway ................................................................................................................................ 6
Part of AWS serverless infrastructure ...................................................................................................... 7
How to get started with Amazon API Gateway ..................................................................................... 7
API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14

API Gateway concepts ................................................................................................................................. 7
Choose between REST APIs and HTTP APIs ......................................................................................... 13
Endpoint type ........................................................................................................................................ 13
Security ................................................................................................................................................... 14
Authorization ......................................................................................................................................... 14
API management .................................................................................................................................. 15
Development .......................................................................................................................................... 15
Monitoring .............................................................................................................................................. 16
Integrations ............................................................................................................................................ 17
Get started with the REST API console ................................................................................................. 17
Step 1: Create a Lambda function .................................................................................................... 18
Step 2: Create a REST API .................................................................................................................. 19
Step 3: Create a Lambda proxy integration .................................................................................... 19

Infrastructure security .......................................................................................................................... 1460
Conﬁguration and vulnerability analysis .......................................................................................... 1461
Best practices ......................................................................................................................................... 1461
Tagging ....................................................................................................................................... 1463
API Gateway resources that can be tagged ..................................................................................... 1463
Tag inheritance in the Amazon API Gateway V1 API ................................................................ 1465
Tag restrictions and usage conventions ...................................................................................... 1466
Attribute-based access control ........................................................................................................... 1466
Limit actions based on resource tags .......................................................................................... 1467
Allow actions based on resource tags ......................................................................................... 1468
Deny tagging operations ................................................................................................................ 1469
Allow tagging operations ............................................................................................................... 1470
API references ............................................................................................................................ 1471
API Gateway service endpoints .......................................................................................................... 1471

to a form expected by the client.
Tutorial: Create a REST API by importing an example
Amazon API Gateway
Developer Guide
For the POST method on an API resource, the method request payload can be passed through 
to the integration request without modiﬁcation, if the method request's payload is of the same 
format as the integration request's payload.
The GET / method request uses the MOCK integration type and is not tied to any real backend 
endpoint. The corresponding Integration response is set up to return a static HTML page. 
When the method is called, the API Gateway simply accepts the request and immediately 
returns the conﬁgured integration response to the client by way of Method response. You can 
use the mock integration to test an API without requiring a backend endpoint. You can also 
use it to serve a local response, generated from a response body-mapping template.
As an API developer, you control the behaviors of your API's frontend interactions by 
conﬁguring the method request and a method response. You control the behaviors of your 
API's backend interactions by setting up the integration request and integration response. 
These involve data mappings between a method and its corresponding integration. For now, 
we focus on testing the API to provide an end-to-end user experience.
Select the Test tab. You might need to choose the right arrow button to show the tab.
For example, to test the POST /pets method, enter the following {"type": 
"dog","price": 249.99} payload into the Request body, and then choose Test.
Tutorial: Create a REST API by importing an example
Amazon API Gateway
Developer Guide
The input speciﬁes the attributes of the pet that we want to add to the list of pets on the 
PetStore website.
The results display as follows:
Tutorial: Create a REST API by importing an example
Amazon API Gateway
Developer Guide
The Log entry of the output shows the state changes from the method request to the
`

**Generated Answer (Response):**
> 

The provided context does not explicitly mention the primary reason why the API Gateway API must be redeployed after making changes to the API, nor does it discuss how this redeployment impacts the request URL. 

However, in general, when you make changes to an API in API Gateway, you need to redeploy the API to apply those changes. This is because API Gateway uses a deployment stage to manage different versions of your API. When you redeploy an API, API Gateway creates a new deployment stage with the updated API configuration.

As for the request URL, redeploying an API in API Gateway typically does not change the request URL. The request URL remains the same, but it now points to the new deployment stage with the updated API configuration.

**Scores:** Faithfulness: 0 | Relevance: 1 | Context Accuracy: 1

---

