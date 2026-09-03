/**
 * PALASH Setu Offline Storage Manager
 * Stores local assessments, custom worksheets, and teacher offline cache
 */

const STORAGE_KEYS = {
  OFFLINE_MODE: 'palash_offline_mode',
  SELECTED_LANG: 'palash_selected_lang',
  STUDENT_ASSESSMENTS: 'palash_student_assessments',
  CUSTOM_LESSONS: 'palash_custom_lessons',
};

export const offlineStorage = {
  getOfflineMode() {
    return localStorage.getItem(STORAGE_KEYS.OFFLINE_MODE) === 'true';
  },

  setOfflineMode(enabled) {
    localStorage.setItem(STORAGE_KEYS.OFFLINE_MODE, enabled ? 'true' : 'false');
  },

  getSelectedLanguage() {
    return localStorage.getItem(STORAGE_KEYS.SELECTED_LANG) || 'santhali';
  },

  setSelectedLanguage(langId) {
    localStorage.setItem(STORAGE_KEYS.SELECTED_LANG, langId);
  },

  getStudentAssessments() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STUDENT_ASSESSMENTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveStudentAssessment(record) {
    const records = this.getStudentAssessments();
    records.unshift({
      ...record,
      id: 'asmt_' + Date.now(),
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem(STORAGE_KEYS.STUDENT_ASSESSMENTS, JSON.stringify(records.slice(0, 50)));
    return records;
  },

  getCustomLessons() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CUSTOM_LESSONS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveCustomLesson(lesson) {
    const list = this.getCustomLessons();
    list.unshift({
      ...lesson,
      id: 'custom_' + Date.now(),
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem(STORAGE_KEYS.CUSTOM_LESSONS, JSON.stringify(list));
    return list;
  },
};
