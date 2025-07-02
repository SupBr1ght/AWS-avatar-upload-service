import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } from "@aws-sdk/client-sqs";
import dotenv from "dotenv";
dotenv.config();

const sqs = new SQSClient({ region: process.env.AWS_REGION });
const queueUrl = process.env.AWS_SQS_URL;

const pollSQS = async () => {
  const receiveParams = {
    QueueUrl: queueUrl,
    MaxNumberOfMessages: 1,
    WaitTimeSeconds: 20, // long polling
    VisibilityTimeout: 30,
  };

  try {
    const command = new ReceiveMessageCommand(receiveParams);
    const data = await sqs.send(command);

    if (data.Messages && data.Messages.length > 0) {
      for (const message of data.Messages) {
        const body = JSON.parse(message.Body);
        console.log("Got SQS message:", body);

        // Delete the message after processing
        const deleteParams = {
          QueueUrl: queueUrl,
          ReceiptHandle: message.ReceiptHandle,
        };
        await sqs.send(new DeleteMessageCommand(deleteParams));
        console.log("Deleted processed message from queue.");
      }
    }
  } catch (error) {
    console.error("SQS polling error:", error);
  } finally {
    setTimeout(pollSQS, 1000); // poll again after delay
  }
};

export default pollSQS;
