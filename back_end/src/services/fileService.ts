import { SecureFile as SecureFileType } from '../types';
import SecureFile from '../models/SecureFile';
import * as bcrypt from 'bcrypt';
import { connectToDatabase } from '../db';

export class FileService {
  /**
   * Create a new secure file record in MongoDB. Passwords will be hashed with
   * bcrypt if provided and the document will include a created timestamp.
   */
  async createFile(
    userId: string,
    filename: string,
    encryptedFileUrl: string,
    fileSize: number,
    passwordProtected: boolean,
    password?: string,
    expiresAt?: string,
    maxDownloads?: number,
    watermarkEnabled: boolean = true
  ): Promise<SecureFileType | null> {
    try {
      await connectToDatabase();
      let passwordHash: string | undefined;
      if (passwordProtected && password) {
        passwordHash = await bcrypt.hash(password, 10);
      }

      const doc = {
        user_id: userId,
        filename,
        encrypted_file_url: encryptedFileUrl,
        file_size: fileSize,
        password_protected: passwordProtected,
        password_hash: passwordHash,
        expires_at: expiresAt,
        max_downloads: maxDownloads,
        watermark_enabled: watermarkEnabled,
      };

      const createdFile = await SecureFile.create(doc);
      const { _id, __v, ...fileFields } = createdFile.toObject();
      return { id: createdFile.id, ...fileFields } as SecureFileType;
    } catch (error) {
      console.error('Error creating file:', error);
      return null;
    }
  }

  /**
   * Retrieve all secure files belonging to a given user sorted by most recent.
   */
  async getUserFiles(userId: string): Promise<SecureFileType[]> {
    try {
      await connectToDatabase();
      const files = await SecureFile.find({ user_id: userId })
        .sort({ created_at: -1 })
        .lean();

      return files.map((f) => {
        const { _id, __v, ...rest } = f;
        return { id: _id.toString(), ...rest };
      }) as SecureFileType[];
    } catch (error) {
      console.error('Error fetching user files:', error);
      return [];
    }
  }

  /**
   * Retrieve a single secure file by its ID. Optionally validate a password if
   * the file is password protected. Returns null if not found or password is
   * invalid.
   */
  async getFile(fileId: string, password?: string): Promise<SecureFileType | null> {
    try {
      await connectToDatabase();
      const file = await SecureFile.findById(fileId);
      if (!file) {
        return null;
      }
      // password validation
      if (file.password_protected) {
        if (!password || !file.password_hash) {
          return null;
        }
        const isValid = await bcrypt.compare(password, file.password_hash);
        if (!isValid) {
          return null;
        }
      }

      const { _id, __v, ...fileFields } = file.toObject();
      return { id: file.id, ...fileFields } as SecureFileType;
    } catch (error) {
      console.error('Error fetching file:', error);
      return null;
    }
  }

  /**
   * Increment the download count for a file. Returns false if the file does
   * not exist or the update fails.
   */
  async incrementDownloadCount(fileId: string): Promise<boolean> {
    try {
      await connectToDatabase();
      const file = await SecureFile.findById(fileId);
      if (!file) {
        return false;
      }
      file.download_count = (file.download_count || 0) + 1;
      await file.save();
      return true;
    } catch (error) {
      console.error('Error incrementing download count:', error);
      return false;
    }
  }

  /**
   * Delete a secure file if it belongs to the specified user.
   */
  async deleteFile(fileId: string, userId: string): Promise<boolean> {
    try {
      await connectToDatabase();
      const result = await SecureFile.deleteOne({ _id: fileId, user_id: userId });
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }
}