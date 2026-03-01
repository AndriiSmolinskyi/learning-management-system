export const AmazonUriParts = {
	AWS_BUCKET_NAME:      'AWS_BUCKET_NAME',
	AWS_S3_REGION:        'AWS_S3_REGION',
	S3:                   's3',
	AMAZON_DOT_COM:       'amazonaws.com',
	HTTPS:                'https://',
	DOCUMENTS:              'documents',
}

export const getUploadedUrl = (bucketName: string, region: string, s3Key: string,): string => {
	return `${AmazonUriParts.HTTPS}${bucketName}.${AmazonUriParts.S3}.${region}.${AmazonUriParts.AMAZON_DOT_COM}/${s3Key}`
}