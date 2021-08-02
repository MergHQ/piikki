import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import * as TE from 'fp-ts/TaskEither'
import { passError } from '../errors'

const bucket = 'piikki'

const cli = new S3Client({
  region: 'eu-west-1',
})

export const putObject = (key: string, body: string) =>
  TE.tryCatch(
    () =>
      cli.send(
        new PutObjectCommand({
          Bucket: bucket,
          Body: body,
          Key: key,
          ContentType: 'application/json',
        })
      ),
    passError('S3PutError')
  )
