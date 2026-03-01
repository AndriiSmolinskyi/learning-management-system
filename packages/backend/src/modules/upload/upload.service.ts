import { v4 as uuid4, } from 'uuid'
import sharp from 'sharp'

import { HttpException, HttpStatus, Injectable, } from '@nestjs/common'
import { ConfigService, } from '@nestjs/config'
import type {
	GetObjectCommandInput,
} from '@aws-sdk/client-s3'
import {
	DeleteObjectCommand,
	GetObjectCommand,
	PutObjectCommand,
	S3Client,
} from '@aws-sdk/client-s3'
import { getSignedUrl, } from '@aws-sdk/s3-request-presigner'
import { AmazonUriParts, getUploadedUrl,} from './upload.constants'
import type { IDecryptedDocument, IUploadFileToAWS, IUploadedFileRes, } from './upload.types'
import { ERROR_MESSAGES, SUCCESS_MESSAGES, } from '../../shared/constants/messages.constants'
import type { Message, } from '../../shared/types'
import { CryptoService, } from '../crypto/crypto.service'
import type { Readable, } from 'stream'

@Injectable()
export class UploadService {
	private readonly s3Client = new S3Client({
		region:      this.configService.getOrThrow('AWS_S3_REGION',),
		credentials: {
			accessKeyId:     this.configService.getOrThrow('AWS_ACCESS_KEY',),
			secretAccessKey: this.configService.getOrThrow('AWS_SECRET_ACCESS_KEY',),
		},
	},)

	constructor(
		private readonly configService: ConfigService,
		private readonly cryptoService: CryptoService,
	) {}

	/**
	 * 1.4
	 * Uploads an avatar image to AWS S3 bucket and returns the URL of the uploaded image.
	 * @param fileName - The name of the file to be uploaded.
	 * @param file - The buffer containing the image data.
	 * @returns A Promise that resolves to the URL of the uploaded avatar image.
	 * @throws Will throw an error if the AWS S3 upload fails.
	 */
	public async uploadAvatar(fileName: string, file: Buffer,): Promise<string> {
		const id: string = uuid4()
		const compressedFile = await sharp(file,)
			.webp({ quality: 90, },)
			.toBuffer()
		const s3Key = `${id}-${fileName}`
		const encodeFileName = encodeURIComponent(s3Key,)
		const bucketName = this.configService.getOrThrow<string>('AWS_BUCKET_NAME',)
		await this.s3Client.send(
			new PutObjectCommand({
				Bucket: bucketName,
				Key:    s3Key,
				Body:   compressedFile,
			},),
		)
		return `https://${bucketName}.s3.amazonaws.com/${encodeFileName}`
	}

	/**
	 * 2.2.1 / 2.2.1.1 / 2.2.1.4
	 * Uploads a document to AWS S3 bucket and returns the URL of the uploaded document.
	 * @param file - The file to be uploaded, represented as an `IUploadFileToAWS` object.
	 * @returns A Promise that resolves to an `IUploadedFileRes` object containing the URL, size, format, name, and storage name of the uploaded document.
	 * @throws Will throw an error if the AWS S3 upload fails.
	 * @remarks
	 * This function extracts the file extension from the original name, generates a unique ID, constructs the S3 key, and sends a `PutObjectCommand` to AWS S3.
	 * If the upload is successful, it calls the `getUploadedUrl` function to obtain the URL of the uploaded document.
	 * The function then constructs an `IUploadedFileRes` object and returns it.
	 * If an error occurs during the upload process, it throws an HTTP exception with a custom error message and a status code of 400 (Bad Request).
	 */
	public async uploadDocument(file: IUploadFileToAWS, isNotToBeEncypted?: boolean,): Promise<IUploadedFileRes> {
		const ext = file.originalname.split('.',)
		const extension = ext[ext.length - 1]
		const filenameWithoutExtension = ext[ext.length - 2]
		const id: string = uuid4()
		const bucketName = this.configService.getOrThrow<string>(AmazonUriParts.AWS_BUCKET_NAME,)
		const region = this.configService.getOrThrow<string>(AmazonUriParts.AWS_S3_REGION,)
		const s3Key = `${AmazonUriParts.DOCUMENTS}/${filenameWithoutExtension}-${id}.${extension.toLowerCase()}`
		try {
			const encryptedBuffer = isNotToBeEncypted ?
				file.buffer :
				this.cryptoService.encryptDocument(file.buffer,)
			await this.s3Client.send(new PutObjectCommand({
				Bucket:      bucketName,
				Key:         s3Key,
				Body:        encryptedBuffer,
				ContentType: file.mimetype,
			},),)
			const url = getUploadedUrl(bucketName, region, s3Key,)
			const uploadedFile = {
				url,
				size:   file.size,
				format: extension ?
					extension.toLowerCase() :
					'',
				name:         file.originalname,
				storageName: `${filenameWithoutExtension}-${id}.${extension.toLowerCase()}`,
			}
			return uploadedFile
		} catch (error) {
			throw new HttpException(ERROR_MESSAGES.UPLOAD_DOCUMENT_ERROR, HttpStatus.BAD_REQUEST,)
		}
	}

	/**
	 * 2.3.3 / 2.3.4
	 * Deletes a file from AWS S3 storage by its filename.
	 *
	 * @param filename - The name of the file to be deleted from the AWS S3 bucket.
	 * @returns A Promise that resolves to a message indicating the successful deletion of the file.
	 * @throws HttpException - If an error occurs during the deletion process.
	 */
	public async deleteFileFromAWS(filename: string,): Promise<Message> {
		const bucketName = this.configService.getOrThrow<string>(AmazonUriParts.AWS_BUCKET_NAME,)
		const fileKey = `${AmazonUriParts.DOCUMENTS}/${filename}`
		try {
			const input = {
				Bucket: bucketName,
				Key:    fileKey,
			}
			const command = new DeleteObjectCommand(input,)
			await this.s3Client.send(command,)
		} catch (error) {
			throw new HttpException(ERROR_MESSAGES.DELETE_DOCUMENT_ERROR, HttpStatus.BAD_REQUEST,)
		}
		return {
			message: SUCCESS_MESSAGES.DOCUMENT_DELETED,
		}
	}

	/**
	 * 2.1.8
	 * Retrieves a pre-signed URL for downloading a file from AWS S3 bucket.
	 * @param filename - The name of the file to be downloaded.
	 * @returns A Promise that resolves to an object containing the pre-signed URL.
	 * @throws Will throw an HTTP exception with a custom error message and a status code of 400 (Bad Request) if the file retrieval fails.
	 * @remarks
	 * This function constructs the S3 key for the specified file, creates an `GetObjectCommand` with the appropriate parameters,
	 * and then uses the `getSignedUrl` function from the AWS SDK to obtain a pre-signed URL.
	 * The pre-signed URL is returned as part of an object with a single property `url`.
	 * If an error occurs during the process, an HTTP exception is thrown with a custom error message and a status code of 400.
	 */
	public async getPresignedUrl(filename: string,): Promise<{url: string}> {
		try {
			const bucketName = this.configService.getOrThrow<string>(AmazonUriParts.AWS_BUCKET_NAME,)
			const fileKey = `${AmazonUriParts.DOCUMENTS}/${filename}`
			const commandInput: GetObjectCommandInput = {
				Bucket:                     bucketName,
				Key:                        fileKey,
				ResponseContentDisposition: `attachment; filename="${filename}"`,
			}
			const command = new GetObjectCommand(commandInput,)
			const url = await getSignedUrl(this.s3Client, command, { expiresIn: 3600, },)
			return { url, }
		} catch (error) {
			throw new HttpException(ERROR_MESSAGES.DOWNLOAD_FILE_ERROR, HttpStatus.BAD_REQUEST,)
		}
	}

	/**
	 * CR-139
 		* Downloads and decrypts a document from the configured S3 bucket.
 		* @param storageName - The unique key/name of the encrypted file stored in S3.
 		* @returns A Promise resolving to an object containing:
 		*  - buffer: The decrypted file contents as a Buffer.
 		*  - filename: The original filename used as the S3 key.
 		*  - contentType: The MIME type of the file or 'application/octet-stream' if undefined.
 		* @throws Throws an error if S3 get operation or decryption fails.
 		* @remarks
 		*  - Retrieves the file from S3 using GetObjectCommand.
 		*  - Converts the S3 stream to a buffer.
 		*  - Decrypts the buffer with the configured cryptoService.
 		*  - Returns the decrypted data along with metadata.
 	*/
	public async downloadDocumentWithDecryption(storageName: string,): Promise<IDecryptedDocument> {
		const bucket = this.configService.getOrThrow<string>(AmazonUriParts.AWS_BUCKET_NAME,)
		const key = `${AmazonUriParts.DOCUMENTS}/${storageName}`

		const command = new GetObjectCommand({
			Bucket:                     bucket,
			Key:                        key,
			ResponseContentDisposition: `attachment; filename="${storageName}"`,
		},)
		const s3Response = await this.s3Client.send(command,)

		const encryptedBuffer = await this.streamToBuffer(s3Response.Body as Readable,)
		const decryptedBuffer = this.cryptoService.decryptDocument(encryptedBuffer,)
		return {
			buffer:      decryptedBuffer,
			filename:    storageName,
			contentType: s3Response.ContentType ?? 'application/octet-stream',
		}
	}

	/**
	   * CR-139
 		* Converts a Readable stream into a single Buffer.
 		* @param stream - The Node.js Readable stream to convert.
 		* @returns A Promise that resolves to a Buffer containing the full stream data.
 		* @throws Rejects the Promise if the stream emits an error.
 		* @remarks
 		*  - Collects all chunks emitted by the stream.
 		*  - Concatenates them into a single Buffer upon stream end.
 	*/
	public async streamToBuffer(stream: Readable,): Promise<Buffer> {
		return new Promise((resolve, reject,) => {
			const chunks: Array<Buffer> = []
			stream.on('data', (chunk,) => {
				chunks.push(Buffer.isBuffer(chunk,) ?
					chunk :
					Buffer.from(chunk,),)
			},)
			stream.on('end', () => {
				resolve(Buffer.concat(chunks,),)
			},)
			stream.on('error', (err,) => {
				reject(err,)
			},)
		},)
	}
}