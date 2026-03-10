export const email = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

export const amount = /^\d+([.,]\d{1,2})?$/

export const numbersRegex = /[^0-9.,]/g

export const formatAmountRegex = /^\d{1,3}(,\d{3})*(\.\d{1,2})?$/