const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const path = require('path');

class StorageManager {
  constructor() {
    this._client = null;
  }

  /**
   * Vérifie si le stockage objet S3 / Cloudflare R2 est activé via les variables d'environnement.
   */
  isConfigured() {
    return Boolean(
      process.env.S3_BUCKET_NAME &&
      process.env.S3_ACCESS_KEY_ID &&
      process.env.S3_SECRET_ACCESS_KEY
    );
  }

  /**
   * Retourne l'instance du client S3 (singleton).
   */
  getClient() {
    if (!this.isConfigured()) {
      return null;
    }

    if (!this._client) {
      const config = {
        region: process.env.S3_REGION || 'auto', // 'auto' pour Cloudflare R2
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID,
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
        },
      };

      // Si un endpoint spécifique est fourni (ex: Cloudflare R2, MinIO, Supabase)
      if (process.env.S3_ENDPOINT) {
        config.endpoint = process.env.S3_ENDPOINT;
      }

      // Requis pour MinIO ou certains émulateurs locaux S3
      if (process.env.S3_FORCE_PATH_STYLE === 'true') {
        config.forcePathStyle = true;
      }

      this._client = new S3Client(config);
    }

    return this._client;
  }

  /**
   * Retourne le nom du bucket configuré.
   */
  getBucket() {
    return process.env.S3_BUCKET_NAME || '';
  }

  /**
   * Retourne la région configurée.
   */
  getRegion() {
    return process.env.S3_REGION || 'auto';
  }

  /**
   * Calcule l'URL publique accessible par les clients / le web.
   */
  getPublicUrl(key) {
    if (process.env.S3_PUBLIC_URL) {
      return `${process.env.S3_PUBLIC_URL.replace(/\/$/, '')}/${key}`;
    }

    if (process.env.MEDIA_BASE_URL) {
      return `${process.env.MEDIA_BASE_URL.replace(/\/$/, '')}/uploads/${key}`;
    }

    // URL par défaut si S3 standard sans CDN personnalisé
    const bucket = this.getBucket();
    const region = this.getRegion();
    if (process.env.S3_ENDPOINT) {
      return `${process.env.S3_ENDPOINT.replace(/\/$/, '')}/${bucket}/${key}`;
    }
    return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
  }

  /**
   * Génère une URL présignée de type PUT pour permettre au frontend d'uploader
   * directement le fichier sur le bucket S3 / Cloudflare R2.
   * Cette méthode contourne la limite de 4.5 Mo imposée par les Serverless Functions de Vercel.
   */
  async generatePresignedPutUrl({ key, contentType, expiresIn = 900 }) {
    if (!this.isConfigured()) {
      throw new Error('Le stockage S3 / Cloudflare R2 n\'est pas configuré.');
    }

    const client = this.getClient();
    const bucket = this.getBucket();

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(client, command, { expiresIn });
    const publicUrl = this.getPublicUrl(key);

    return {
      uploadUrl,
      publicUrl,
      s3Key: key,
      s3Bucket: bucket,
      s3Region: this.getRegion(),
    };
  }

  /**
   * Upload direct d'un buffer ou stream (utile pour les petits fichiers ou scripts de seed).
   */
  async uploadBuffer({ key, buffer, contentType }) {
    if (!this.isConfigured()) {
      throw new Error('Le stockage S3 / Cloudflare R2 n\'est pas configuré.');
    }

    const client = this.getClient();
    const bucket = this.getBucket();

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    });

    await client.send(command);

    return {
      s3Key: key,
      s3Bucket: bucket,
      s3Region: this.getRegion(),
      publicUrl: this.getPublicUrl(key),
    };
  }

  /**
   * Supprime un objet du bucket S3 / Cloudflare R2.
   */
  async deleteObject({ key, bucket = null }) {
    if (!this.isConfigured()) {
      return;
    }

    const client = this.getClient();
    const targetBucket = bucket || this.getBucket();

    const command = new DeleteObjectCommand({
      Bucket: targetBucket,
      Key: key,
    });

    await client.send(command);
  }
}

module.exports = new StorageManager();

