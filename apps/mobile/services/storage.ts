// ============================================================
// Paladeium — Supabase Storage Service (AMD-008)
// Typed upload helpers for avatars, lost-found images,
// and EduRev evidence attachments.
// ============================================================

import * as ImagePicker from 'expo-image-picker';
import { supabase } from './supabase';

// Storage bucket names — must exist in Supabase Dashboard → Storage
const BUCKETS = {
  avatars: 'avatars',
  lostfound: 'lostfound',
  edurev: 'edurev',
} as const;

type Bucket = (typeof BUCKETS)[keyof typeof BUCKETS];

/** Result type for all upload operations */
export interface UploadResult {
  success: boolean;
  publicUrl: string | null;
  error: string | null;
}

/**
 * Opens the device image picker (camera roll).
 * Requests media library permissions if not already granted.
 *
 * @returns The selected image URI, or null if cancelled / denied.
 */
export async function pickImage(): Promise<string | null> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    quality: 0.8,
    aspect: [1, 1],
  });

  if (result.canceled) return null;
  return result.assets[0]?.uri ?? null;
}

/**
 * Opens the device camera to capture a new photo.
 * Requests camera permissions if not already granted.
 *
 * @returns The captured image URI, or null if cancelled / denied.
 */
export async function captureImage(): Promise<string | null> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    return null;
  }

  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    quality: 0.8,
    aspect: [1, 1],
  });

  if (result.canceled) return null;
  return result.assets[0]?.uri ?? null;
}

/**
 * Internal: converts a local file URI to a Blob and uploads it
 * to the specified Supabase Storage bucket.
 */
async function uploadFile(
  bucket: Bucket,
  path: string,
  fileUri: string,
  contentType = 'image/jpeg'
): Promise<UploadResult> {
  try {
    // Fetch the file as a blob (works for both file:// and content:// URIs)
    const response = await fetch(fileUri);
    const blob = await response.blob();

    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, blob, {
        contentType,
        upsert: true, // overwrite if re-uploading (e.g. updating avatar)
      });

    if (error) {
      return { success: false, publicUrl: null, error: error.message };
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return { success: true, publicUrl: data.publicUrl, error: null };
  } catch (err) {
    return {
      success: false,
      publicUrl: null,
      error: err instanceof Error ? err.message : 'Upload failed',
    };
  }
}

/**
 * Uploads a user's profile avatar.
 * Path: `avatars/{userId}.jpg`
 *
 * @param userId - The Clerk user ID (becomes the filename for easy lookup)
 * @param fileUri - Local file URI from expo-image-picker
 */
export function uploadAvatar(userId: string, fileUri: string): Promise<UploadResult> {
  return uploadFile(BUCKETS.avatars, `${userId}.jpg`, fileUri);
}

/**
 * Uploads a photo for a Lost & Found item report.
 * Path: `lostfound/{itemId}/{timestamp}.jpg`
 *
 * @param itemId - The UUID of the lost_item or found_item row
 * @param fileUri - Local file URI from expo-image-picker
 */
export function uploadLostFoundImage(
  itemId: string,
  fileUri: string
): Promise<UploadResult> {
  const filename = `${Date.now()}.jpg`;
  return uploadFile(BUCKETS.lostfound, `${itemId}/${filename}`, fileUri);
}

/**
 * Uploads an EduRev evidence file (certificate, completion screenshot, etc.).
 * Path: `edurev/{userId}/{timestamp}.jpg`
 *
 * @param userId - The Clerk user ID
 * @param fileUri - Local file URI from expo-image-picker
 */
export function uploadEduRevEvidence(
  userId: string,
  fileUri: string
): Promise<UploadResult> {
  const filename = `${Date.now()}.jpg`;
  return uploadFile(BUCKETS.edurev, `${userId}/${filename}`, fileUri);
}
