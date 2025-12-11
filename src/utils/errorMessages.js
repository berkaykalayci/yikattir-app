export const getErrorMessage = (error) => {
  if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
    return 'İnternet bağlantınızı kontrol edin ve tekrar deneyin.';
  }

  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return 'İstek zaman aşımına uğradı. Lütfen tekrar deneyin.';
  }

  if (error.response?.data?.error) {
    return error.response.data.error;
  }

  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  if (error.response?.status) {
    switch (error.response.status) {
      case 400:
        return 'Geçersiz istek. Lütfen bilgilerinizi kontrol edin.';
      case 401:
        return 'Oturumunuz sona ermiş. Lütfen tekrar giriş yapın.';
      case 403:
        return 'Bu işlem için yetkiniz bulunmamaktadır.';
      case 404:
        return 'Aradığınız kayıt bulunamadı.';
      case 409:
        return error.response.data?.error || 'Bu işlem zaten yapılmış.';
      case 500:
        return 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.';
      case 503:
        return 'Servis şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.';
      default:
        return 'Bir hata oluştu. Lütfen tekrar deneyin.';
    }
  }

  return 'Bir hata oluştu. Lütfen tekrar deneyin.';
};

export const logError = (context, error) => {
  if (__DEV__) {
    console.error(`[${context}]`, error);
  }
};

