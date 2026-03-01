export type JWTPayload = {
	clientId?: string
   roles: Array<string>
   iat: number
   exp: number
}

export type GenerateJWTTokenProps = {
	clientId?: string
   roles: Array<string>
   expirationTime: number
   privateKey: string
}

export type GenerateTokensPairProps = {
	roles: Array<string>
	clientId?: string
}

export type GenerateTokensPairReturnType = {
   token: string
   refreshToken: string
}
