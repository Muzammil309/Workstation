"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

interface LanguageContextType {
  language: string
  setLanguage: (lang: string) => void
  t: (key: string) => string
}

const translations = {
  en: {
    // Dashboard
    'dashboard': 'Dashboard',
    'tasks': 'Tasks',
    'projects': 'Projects',
    'team': 'Team',
    'analytics': 'Analytics',
    'calendar': 'Calendar',
    'reports': 'Reports',
    'profile': 'Profile',
    
    // Common
    'save': 'Save',
    'cancel': 'Cancel',
    'edit': 'Edit',
    'delete': 'Delete',
    'create': 'Create',
    'update': 'Update',
    'loading': 'Loading...',
    'error': 'Error',
    'success': 'Success',
    
    // Task related
    'newTask': 'New Task',
    'taskTitle': 'Task Title',
    'taskDescription': 'Description',
    'assignee': 'Assignee',
    'priority': 'Priority',
    'deadline': 'Deadline',
    'status': 'Status',
    'pending': 'Pending',
    'inProgress': 'In Progress',
    'completed': 'Completed',
    
    // Project related
    'newProject': 'New Project',
    'projectName': 'Project Name',
    'projectDescription': 'Project Description',
    'startDate': 'Start Date',
    'endDate': 'End Date',
    'teamMembers': 'Team Members',
    'budget': 'Budget',
    
    // Profile
    'personalInfo': 'Personal Info',
    'preferences': 'Preferences',
    'security': 'Security',
    'notifications': 'Notifications',
    'fullName': 'Full Name',
    'email': 'Email',
    'phone': 'Phone',
    'location': 'Location',
    'bio': 'Bio',
    'skills': 'Skills',
    'theme': 'Theme',
    'language': 'Language',
    'changePassword': 'Change Password',
    'twoFactorAuth': 'Two-Factor Authentication',
    
    // Actions
    'addNewUser': 'Add New User',
    'searchUsers': 'Search users by name, email or department...',
    'allStatus': 'All Status',
    'allRoles': 'All Roles',
    'user': 'User',
    'admin': 'Admin',
    'active': 'Active',
    'inactive': 'Inactive'
  },
  es: {
    'dashboard': 'Panel de Control',
    'tasks': 'Tareas',
    'projects': 'Proyectos',
    'team': 'Equipo',
    'analytics': 'Análisis',
    'calendar': 'Calendario',
    'reports': 'Reportes',
    'profile': 'Perfil',
    
    'save': 'Guardar',
    'cancel': 'Cancelar',
    'edit': 'Editar',
    'delete': 'Eliminar',
    'create': 'Crear',
    'update': 'Actualizar',
    'loading': 'Cargando...',
    'error': 'Error',
    'success': 'Éxito',
    
    'newTask': 'Nueva Tarea',
    'taskTitle': 'Título de Tarea',
    'taskDescription': 'Descripción',
    'assignee': 'Asignado a',
    'priority': 'Prioridad',
    'deadline': 'Fecha Límite',
    'status': 'Estado',
    'pending': 'Pendiente',
    'inProgress': 'En Progreso',
    'completed': 'Completado',
    
    'newProject': 'Nuevo Proyecto',
    'projectName': 'Nombre del Proyecto',
    'projectDescription': 'Descripción del Proyecto',
    'startDate': 'Fecha de Inicio',
    'endDate': 'Fecha de Fin',
    'teamMembers': 'Miembros del Equipo',
    'budget': 'Presupuesto',
    
    'personalInfo': 'Información Personal',
    'preferences': 'Preferencias',
    'security': 'Seguridad',
    'notifications': 'Notificaciones',
    'fullName': 'Nombre Completo',
    'email': 'Correo Electrónico',
    'phone': 'Teléfono',
    'location': 'Ubicación',
    'bio': 'Biografía',
    'skills': 'Habilidades',
    'theme': 'Tema',
    'language': 'Idioma',
    'changePassword': 'Cambiar Contraseña',
    'twoFactorAuth': 'Autenticación de Dos Factores',
    
    'addNewUser': 'Agregar Nuevo Usuario',
    'searchUsers': 'Buscar usuarios por nombre, correo o departamento...',
    'allStatus': 'Todo Estado',
    'allRoles': 'Todos los Roles',
    'user': 'Usuario',
    'admin': 'Administrador',
    'active': 'Activo',
    'inactive': 'Inactivo'
  },
  fr: {
    'dashboard': 'Tableau de Bord',
    'tasks': 'Tâches',
    'projects': 'Projets',
    'team': 'Équipe',
    'analytics': 'Analyses',
    'calendar': 'Calendrier',
    'reports': 'Rapports',
    'profile': 'Profil',
    
    'save': 'Sauvegarder',
    'cancel': 'Annuler',
    'edit': 'Modifier',
    'delete': 'Supprimer',
    'create': 'Créer',
    'update': 'Mettre à jour',
    'loading': 'Chargement...',
    'error': 'Erreur',
    'success': 'Succès',
    
    'newTask': 'Nouvelle Tâche',
    'taskTitle': 'Titre de la Tâche',
    'taskDescription': 'Description',
    'assignee': 'Assigné à',
    'priority': 'Priorité',
    'deadline': 'Date Limite',
    'status': 'Statut',
    'pending': 'En Attente',
    'inProgress': 'En Cours',
    'completed': 'Terminé',
    
    'newProject': 'Nouveau Projet',
    'projectName': 'Nom du Projet',
    'projectDescription': 'Description du Projet',
    'startDate': 'Date de Début',
    'endDate': 'Date de Fin',
    'teamMembers': 'Membres de l\'Équipe',
    'budget': 'Budget',
    
    'personalInfo': 'Informations Personnelles',
    'preferences': 'Préférences',
    'security': 'Sécurité',
    'notifications': 'Notifications',
    'fullName': 'Nom Complet',
    'email': 'E-mail',
    'phone': 'Téléphone',
    'location': 'Localisation',
    'bio': 'Biographie',
    'skills': 'Compétences',
    'theme': 'Thème',
    'language': 'Langue',
    'changePassword': 'Changer le Mot de Passe',
    'twoFactorAuth': 'Authentification à Deux Facteurs',
    
    'addNewUser': 'Ajouter un Nouvel Utilisateur',
    'searchUsers': 'Rechercher des utilisateurs par nom, e-mail ou département...',
    'allStatus': 'Tous les Statuts',
    'allRoles': 'Tous les Rôles',
    'user': 'Utilisateur',
    'admin': 'Administrateur',
    'active': 'Actif',
    'inactive': 'Inactif'
  },
  ar: {
    'dashboard': 'لوحة التحكم',
    'tasks': 'المهام',
    'projects': 'المشاريع',
    'team': 'الفريق',
    'analytics': 'التحليلات',
    'calendar': 'التقويم',
    'reports': 'التقارير',
    'profile': 'الملف الشخصي',
    
    'save': 'حفظ',
    'cancel': 'إلغاء',
    'edit': 'تعديل',
    'delete': 'حذف',
    'create': 'إنشاء',
    'update': 'تحديث',
    'loading': 'جاري التحميل...',
    'error': 'خطأ',
    'success': 'نجح',
    
    'newTask': 'مهمة جديدة',
    'taskTitle': 'عنوان المهمة',
    'taskDescription': 'الوصف',
    'assignee': 'تعيين إلى',
    'priority': 'الأولوية',
    'deadline': 'الموعد النهائي',
    'status': 'الحالة',
    'pending': 'في الانتظار',
    'inProgress': 'قيد التنفيذ',
    'completed': 'مكتمل',
    
    'newProject': 'مشروع جديد',
    'projectName': 'اسم المشروع',
    'projectDescription': 'وصف المشروع',
    'startDate': 'تاريخ البدء',
    'endDate': 'تاريخ الانتهاء',
    'teamMembers': 'أعضاء الفريق',
    'budget': 'الميزانية',
    
    'personalInfo': 'المعلومات الشخصية',
    'preferences': 'التفضيلات',
    'security': 'الأمان',
    'notifications': 'الإشعارات',
    'fullName': 'الاسم الكامل',
    'email': 'البريد الإلكتروني',
    'phone': 'الهاتف',
    'location': 'الموقع',
    'bio': 'السيرة الذاتية',
    'skills': 'المهارات',
    'theme': 'المظهر',
    'language': 'اللغة',
    'changePassword': 'تغيير كلمة المرور',
    'twoFactorAuth': 'المصادقة الثنائية',
    
    'addNewUser': 'إضافة مستخدم جديد',
    'searchUsers': 'البحث عن المستخدمين بالاسم أو البريد الإلكتروني أو القسم...',
    'allStatus': 'جميع الحالات',
    'allRoles': 'جميع الأدوار',
    'user': 'مستخدم',
    'admin': 'مدير',
    'active': 'نشط',
    'inactive': 'غير نشط'
  }
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState('en')

  useEffect(() => {
    // Load language from localStorage or user preferences
    const savedLanguage = localStorage.getItem('language') || 'en'
    setLanguage(savedLanguage)
  }, [])

  const handleSetLanguage = (lang: string) => {
    setLanguage(lang)
    localStorage.setItem('language', lang)
    // You can also update the user's preference in the database here
  }

  const t = (key: string): string => {
    const currentTranslations = translations[language as keyof typeof translations]
    if (currentTranslations && key in currentTranslations) {
      return currentTranslations[key as keyof typeof currentTranslations]
    }
    return key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
