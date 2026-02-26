export interface IUploadFileToAWS {
    fieldname: string
    originalname: string
    encoding: string
    mimetype: string
    buffer: Buffer
    size: number
}
export interface IUploadedFileRes {
    url: string
    size: number
    format: string
    name: string
    storageName: string
}

export interface IDecryptedDocument {
	buffer: Buffer,
	filename: string,
	contentType: string
}