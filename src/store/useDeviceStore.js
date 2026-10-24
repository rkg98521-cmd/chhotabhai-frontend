import { create } from 'zustand';

const getInitialDevice = () => {
  try {
    const saved = localStorage.getItem('chhota_selected_device');
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    console.warn('Failed to parse saved device from localStorage:', e);
    return null;
  }
};

export const useDeviceStore = create((set) => ({
  selectedDevice: getInitialDevice(),
  isDeviceModalOpen: false,

  setDevice: (brand, model) => {
    const deviceObj = {
      brand: brand || '',
      model: model || '',
    };
    try {
      localStorage.setItem('chhota_selected_device', JSON.stringify(deviceObj));
    } catch (e) {
      console.warn('Failed to save device to localStorage:', e);
    }
    set({ selectedDevice: deviceObj, isDeviceModalOpen: false });
  },

  clearDevice: () => {
    try {
      localStorage.removeItem('chhota_selected_device');
    } catch (e) {
      console.warn('Failed to clear device from localStorage:', e);
    }
    set({ selectedDevice: null });
  },

  openModal: () => set({ isDeviceModalOpen: true }),
  closeModal: () => set({ isDeviceModalOpen: false }),
}));

export default useDeviceStore;
