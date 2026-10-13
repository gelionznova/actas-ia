import { useState } from "react";
import {
  getMeetingPhotosApi,
  addMeetingPhotoApi,
  deletePhotoApi,
} from "../api/meetingPhoto";
import { useAuth } from "./useAuth";

// Hook solo con funciones, sin estado interno
export function useMeetingPhoto() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { auth } = useAuth();
  // Traer fotos de una reunión
  const getPhotos = async (meetingId, token) => {
    return await getMeetingPhotosApi(meetingId, token);
  };

  // Subir una o varias fotos
  const addPhoto = async (formData, token) => {
    return await addMeetingPhotoApi(formData, token);
  };

  const deletePhoto = async (id) => {
    try {
      setLoading(true);
      await deletePhotoApi(id, auth.token);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError(error);
      throw error;
    }
  };

  return { loading, error, getPhotos, addPhoto, deletePhoto };
}
