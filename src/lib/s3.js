import { S3Client } from '@aws-sdk/client-s3'

const s3Client = new S3Client({
  endpoint: 'https://vbytyrxlktjmbqxunrhw.supabase.co/storage/v1/s3',
  region: 'eu-central-1',
  credentials: {
    accessKeyId: '88cb45fa73ff0369de72efd69db82e44',
    secretAccessKey: '7991c97a7e85dba474aa810bdaf1ebd375ab9431af96c5871c6abadc391d912a'
  },
  forcePathStyle: true
})

export { s3Client } 