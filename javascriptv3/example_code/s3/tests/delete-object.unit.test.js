// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { S3ServiceException } from "@aws-sdk/client-s3";
import { describe, it, expect, vi } from "vitest";

const send = vi.fn();

vi.doMock("@aws-sdk/client-s3", async () => {
  const actual = await vi.importActual("@aws-sdk/client-s3");
  return {
    ...actual,
    waitUntilObjectNotExists: () => Promise.resolve(),
    S3Client: class {
      send = send;
    },
  };
});

const { main } = await import("../actions/delete-object.js");

describe("delete-object", () => {
  it("should log the response from the service", async () => {
    send.mockResolvedValueOnce();

    const spy = vi.spyOn(console, "log");

    await main({ bucketName: "amzn-s3-demo-bucket", key: "my-object" });

    expect(spy).toHaveBeenCalledWith(
      `The object "my-object" from bucket "amzn-s3-demo-bucket" was deleted, or it didn't exist.`,
    );
  });

  it("should log a relevant error when the bucket doesn't exist", async () => {
    const error = new S3ServiceException("The specified bucket does not exist");
    error.$fault = "server"; // Workaround until PR is released. https://github.com/smithy-lang/smithy-typescript/pull/1503
    error.$metadata = "metadata"; // Workaround until PR is released. https://github.com/smithy-lang/smithy-typescript/pull/1503
    error.name = "NoSuchBucket";
    const bucketName = "amzn-s3-demo-bucket";
    send.mockRejectedValueOnce(error);

    const spy = vi.spyOn(console, "error");

    await main({ bucketName });

    expect(spy).toHaveBeenCalledWith(
      `Error from S3 while deleting object from ${bucketName}. The bucket doesn't exist.`,
    );
  });

  it("should indicate a failure came from S3 when the error isn't generic", async () => {
    const error = new S3ServiceException("Some S3 service exception.");
    error.$fault = "server"; // Workaround until PR is released. https://github.com/smithy-lang/smithy-typescript/pull/1503
    error.$metadata = "metadata"; // Workaround until PR is released. https://github.com/smithy-lang/smithy-typescript/pull/1503
    error.name = "ServiceException";
    const bucketName = "amzn-s3-demo-bucket";
    send.mockRejectedValueOnce(error);

    const spy = vi.spyOn(console, "error");

    await main({ bucketName });

    expect(spy).toHaveBeenCalledWith(
      `Error from S3 while deleting object from ${bucketName}.  ${error.name}: ${error.message}`,
    );
  });

  it("should throw errors that are not S3 specific", async () => {
    const bucketName = "amzn-s3-demo-bucket";
    send.mockRejectedValueOnce(new Error());

    await expect(() => main({ bucketName })).rejects.toBeTruthy();
  });
});
