import { createClient } from "@metagptx/web-sdk";

export const client = createClient();

// Auth helpers
export const checkAuth = async () => {
  try {
    const user = await client.auth.me();
    return user?.data || null;
  } catch {
    return null;
  }
};

export const login = async () => {
  await client.auth.toLogin();
};

export const logout = async () => {
  await client.auth.logout();
};

// KYC Profile helpers
export const getMyKycProfile = async () => {
  try {
    const response = await client.entities.kyc_profiles.query({ query: {}, limit: 1 });
    const items = response?.data?.items || [];
    return items.length > 0 ? items[0] : null;
  } catch {
    return null;
  }
};

export const createKycProfile = async (data: {
  full_name: string;
  nin: string;
  phone: string;
  role: string;
  nin_document_key?: string;
  selfie_key?: string;
  ai_similarity_score?: number;
  status: string;
  created_at: string;
}) => {
  const response = await client.entities.kyc_profiles.create({ data });
  return response?.data;
};

// Ride helpers
export const createRide = async (data: {
  mode: string;
  pickup_state: string;
  pickup_lga: string;
  pickup_street: string;
  destination_state: string;
  destination_lga: string;
  destination_street: string;
  fare: number;
  status: string;
  created_at: string;
}) => {
  const response = await client.entities.rides.create({ data });
  return response?.data;
};

export const getMyRides = async () => {
  try {
    const response = await client.entities.rides.query({
      query: {},
      sort: "-created_at",
      limit: 50,
    });
    return response?.data?.items || [];
  } catch {
    return [];
  }
};

export const updateRide = async (id: string, data: Record<string, unknown>) => {
  const response = await client.entities.rides.update({ id, data });
  return response?.data;
};

// Payment helpers
export const createPayment = async (data: {
  ride_id: number;
  amount: number;
  admin_share: number;
  partner_share: number;
  status: string;
  created_at: string;
}) => {
  const response = await client.entities.payments.create({ data });
  return response?.data;
};

export const getMyPayments = async () => {
  try {
    const response = await client.entities.payments.query({
      query: {},
      sort: "-created_at",
      limit: 50,
    });
    return response?.data?.items || [];
  } catch {
    return [];
  }
};

// Admin API helpers
export const getAdminStats = async () => {
  const response = await client.apiCall.invoke({
    url: "/api/v1/admin/stats",
    method: "GET",
    data: {},
  });
  return response?.data;
};

export const getPendingKyc = async () => {
  const response = await client.entities.kyc_profiles.queryAll({
    query: { status: "PENDING_AI_AUDIT" },
    sort: "-created_at",
    limit: 100,
  });
  return response?.data?.items || [];
};

export const getPendingPayments = async () => {
  const response = await client.entities.payments.queryAll({
    query: { status: "TRANSFERRED" },
    sort: "-created_at",
    limit: 100,
  });
  return response?.data?.items || [];
};

export const getAllPayments = async () => {
  const response = await client.entities.payments.queryAll({
    query: { status: "CONFIRMED" },
    sort: "-created_at",
    limit: 200,
  });
  return response?.data?.items || [];
};

export const getAllRides = async () => {
  const response = await client.entities.rides.queryAll({
    query: {},
    sort: "-created_at",
    limit: 200,
  });
  return response?.data?.items || [];
};

export const activateAccount = async (kyc_profile_id: number) => {
  const response = await client.apiCall.invoke({
    url: "/api/v1/admin/activate-account",
    method: "POST",
    data: { kyc_profile_id },
  });
  return response?.data;
};

export const suspendAccount = async (kyc_profile_id: number) => {
  const response = await client.apiCall.invoke({
    url: "/api/v1/admin/suspend-account",
    method: "POST",
    data: { kyc_profile_id },
  });
  return response?.data;
};

export const confirmPayment = async (payment_id: number) => {
  const response = await client.apiCall.invoke({
    url: "/api/v1/admin/confirm-payment",
    method: "POST",
    data: { payment_id },
  });
  return response?.data;
};

// Object storage helpers
export const uploadFile = async (bucketName: string, file: File) => {
  const objectKey = `${Date.now()}-${file.name}`;
  await client.storage.upload({
    bucket_name: bucketName,
    object_key: objectKey,
    file,
  });
  return objectKey;
};

export const getFileUrl = async (bucketName: string, objectKey: string) => {
  const response = await client.storage.getDownloadUrl({
    bucket_name: bucketName,
    object_key: objectKey,
  });
  return response?.data?.download_url || "";
};