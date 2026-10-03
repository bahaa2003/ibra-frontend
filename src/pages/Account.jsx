import React, { useEffect, useMemo, useRef, useState } from 'react';
import { resolveImageUrl } from '../utils/imageUrl';
import defaultBoyAvatar from '../assets/default-boy-avatar.webp';
import generatedAvatar1 from '../assets/Generated image 1.png';
import generatedAvatar2 from '../assets/Generated image 2.jpg';
import generatedAvatar3 from '../assets/Generated image 3.jpg';
import generatedAvatar4 from '../assets/Generated image 4.jpg';
import generatedAvatar5 from '../assets/Generated image 5.png';
import { motion } from 'framer-motion';
import { Camera, Check, Eye, EyeOff, KeyRound, LoaderCircle, Mail, Phone, Save, ShieldCheck, User, UserCircle2, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input, { inputBaseClassName } from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import SaveChangesBar from '../components/account/SaveChangesBar';
import useAuthStore from '../store/useAuthStore';
import useAdminStore from '../store/useAdminStore';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../components/ui/Toast';
import { validatePhone } from '../utils/validation';

const MAX_AVATAR_FILE_SIZE = 2 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const PRESET_AVATARS = [
  { id: 'generated-1', src: generatedAvatar1, filename: 'ibra-avatar-1.png' },
  { id: 'generated-2', src: generatedAvatar2, filename: 'ibra-avatar-2.jpg' },
  { id: 'generated-3', src: generatedAvatar3, filename: 'ibra-avatar-3.jpg' },
  { id: 'generated-4', src: generatedAvatar4, filename: 'ibra-avatar-4.jpg' },
  { id: 'generated-5', src: generatedAvatar5, filename: 'ibra-avatar-5.png' }
];

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const usernameRegex = /^[a-zA-Z0-9_.-]{3,30}$/;
const getSelectedAvatarStorageKey = (userId) => `ibra:selected-avatar:${userId}`;

const getProfileFromUser = (user) => {
  const fullName = String(user?.name || '').trim();
  const username = String(user?.username || '').trim();
  const email = String(user?.email || '').trim().toLowerCase();
  const phone = String(user?.phone || '').trim();
  const avatar = String(user?.avatar || '').trim();

  return { fullName, username, email, phone, avatar };
};

const Account = () => {
  const location = useLocation();
  const fileInputRef = useRef(null);
  const passwordSectionRef = useRef(null);

  const { user, updateUserSession } = useAuthStore();
  const { updateUserProfile, updateUserAvatar } = useAdminStore();
  const { addToast } = useToast();
  const { language } = useLanguage();

  const isEnglish = language === 'en';
  const text = useMemo(
    () =>
      isEnglish
        ? {
            pageTitle: 'My Account',
            pageSubtitle: 'View and manage your personal details and security preferences',
            activeAccount: 'Active account',
            changePhoto: 'Change image',
            removePhoto: 'Remove image',
            imageHint: 'Supported: JPG, JPEG, PNG, WEBP (max 2MB)',
            personalInfo: 'Personal Info',
            fullName: 'Full name',
            username: 'Username (optional)',
            contactInfo: 'Contact Info',
            emailAddress: 'Email address',
            phoneNumber: 'Phone number',
            emailVerified: 'Email verified',
            emailNotVerified: 'Email not verified',
            email2faHint: 'Email is used for two-factor verification.',
            passwordCard: 'Change Password',
            currentPassword: 'Current password',
            newPassword: 'New password',
            confirmPassword: 'Confirm new password',
            passwordHint: 'Use at least 8 characters including uppercase, lowercase, and a number.',
            saveLabel: 'Save changes',
            cancelLabel: 'Cancel',
            dirtyHint: 'You have unsaved changes.',
            cleanHint: 'Everything is saved.',
            saveSuccess: 'Account changes saved successfully.',
            saveError: 'Could not save account changes.',
            unsavedAlert: 'You have pending edits. Save or cancel before leaving this page.',
            loading: 'Loading account data...',
            validationRequired: 'This field is required.',
            validationNameMin: 'Name must be at least 3 characters.',
            validationNameMax: 'Name must be no more than 60 characters.',
            validationUsername: 'Username must be 3-30 chars, letters/numbers/._- only.',
            validationEmail: 'Enter a valid email format.',
            validationPhone: 'Enter a valid phone number.',
            validationCurrentPassword: 'Current password is required to change password.',
            validationPasswordLength: 'New password must be at least 8 characters.',
            validationPasswordPattern: 'Password must include uppercase, lowercase, and a number.',
            validationPasswordMatch: 'Confirmation password does not match.',
            invalidImageType: 'Invalid image type. Use JPG, JPEG, PNG, or WEBP.',
            invalidImageSize: 'Image size must be 2MB or less.',
            securityTitle: 'Security',
            profileTitle: 'Profile'
          }
        : {
            pageTitle: 'حسابي',
            pageSubtitle: 'عرض وتعديل بياناتك الشخصية وإعدادات الأمان',
            activeAccount: 'حساب نشط',
            changePhoto: 'تغيير الصورة',
            removePhoto: 'إزالة الصورة',
            imageHint: 'الصيغ المدعومة: JPG, JPEG, PNG, WEBP (بحد أقصى 2MB)',
            personalInfo: 'البيانات الشخصية',
            fullName: 'الاسم الكامل',
            username: 'اسم العرض (اختياري)',
            contactInfo: 'بيانات التواصل',
            emailAddress: 'البريد الإلكتروني',
            phoneNumber: 'رقم الهاتف',
            emailVerified: 'البريد موثّق',
            emailNotVerified: 'البريد غير موثّق',
            email2faHint: 'يُستخدم البريد الإلكتروني للتحقق في المصادقة الثنائية.',
            passwordCard: 'تغيير كلمة المرور',
            currentPassword: 'كلمة المرور الحالية',
            newPassword: 'كلمة المرور الجديدة',
            confirmPassword: 'تأكيد كلمة المرور الجديدة',
            passwordHint: 'استخدم 8 أحرف على الأقل تتضمن حرفًا كبيرًا وصغيرًا ورقمًا.',
            saveLabel: 'حفظ التعديلات',
            cancelLabel: 'إلغاء',
            dirtyHint: 'لديك تغييرات غير محفوظة.',
            cleanHint: 'كل التعديلات محفوظة.',
            saveSuccess: 'تم حفظ تعديلات الحساب بنجاح.',
            saveError: 'تعذّر حفظ تعديلات الحساب.',
            unsavedAlert: 'لديك تعديلات معلّقة. احفظها أو ألغها قبل مغادرة الصفحة.',
            loading: 'جاري تحميل بيانات الحساب...',
            validationRequired: 'هذا الحقل مطلوب.',
            validationNameMin: 'الاسم يجب أن يكون 3 أحرف على الأقل.',
            validationNameMax: 'الاسم يجب ألا يتجاوز 60 حرفًا.',
            validationUsername: 'اسم العرض يجب أن يكون 3-30 حرفًا ويقبل الأحرف والأرقام و . _ - فقط.',
            validationEmail: 'أدخل بريدًا إلكترونيًا بصيغة صحيحة.',
            validationPhone: 'أدخل رقم هاتف بصيغة صحيحة.',
            validationCurrentPassword: 'كلمة المرور الحالية مطلوبة لتغيير كلمة المرور.',
            validationPasswordLength: 'كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل.',
            validationPasswordPattern: 'كلمة المرور يجب أن تحتوي على حرف كبير وصغير ورقم.',
            validationPasswordMatch: 'تأكيد كلمة المرور غير مطابق.',
            invalidImageType: 'نوع الصورة غير صالح. استخدم JPG أو JPEG أو PNG أو WEBP.',
            invalidImageSize: 'حجم الصورة يجب ألا يتجاوز 2MB.',
            securityTitle: 'الأمان',
            profileTitle: 'الملف الشخصي'
          },
    [isEnglish]
  );
  const avatarPickerText = isEnglish
    ? {
        title: 'Choose your avatar',
        hint: 'Select one of your designed avatars. It will be saved automatically.',
        saving: 'Saving avatar...',
        saved: 'Avatar saved successfully.',
        error: 'Could not save the avatar.'
      }
    : {
        title: '\u0627\u062e\u062a\u0631 \u0627\u0644\u0623\u0641\u0627\u062a\u0627\u0631',
        hint: '\u0627\u062e\u062a\u0631 \u0635\u0648\u0631\u0629 \u0645\u0646 \u062a\u0635\u0645\u064a\u0645\u0627\u062a\u0643 \u0648\u0633\u064a\u062a\u0645 \u062d\u0641\u0638\u0647\u0627 \u062a\u0644\u0642\u0627\u0626\u064a\u064b\u0627.',
        saving: '\u062c\u0627\u0631\u064d \u062d\u0641\u0638 \u0627\u0644\u0623\u0641\u0627\u062a\u0627\u0631...',
        saved: '\u062a\u0645 \u062d\u0641\u0638 \u0627\u0644\u0623\u0641\u0627\u062a\u0627\u0631 \u0628\u0646\u062c\u0627\u062d.',
        error: '\u062a\u0639\u0630\u0651\u0631 \u062d\u0641\u0638 \u0627\u0644\u0623\u0641\u0627\u062a\u0627\u0631.'
      };

  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAvatarSaving, setIsAvatarSaving] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState(() =>
    user?.id ? localStorage.getItem(getSelectedAvatarStorageKey(user.id)) || '' : ''
  );
  const [saveState, setSaveState] = useState({ type: 'idle', message: '' });
  const [errors, setErrors] = useState({});

  const [savedProfile, setSavedProfile] = useState(() => getProfileFromUser(user));
  const [form, setForm] = useState(() => ({
    ...getProfileFromUser(user),
    avatarPreview: String(user?.avatar || '').trim(),
    avatarFile: null,
    avatarPreset: null,
    avatarAction: 'keep'
  }));
  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' });
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState({ current: false, next: false, confirm: false });

  useEffect(() => {
    const storedPresetId = user?.id ? localStorage.getItem(getSelectedAvatarStorageKey(user.id)) || '' : '';
    const storedPreset = PRESET_AVATARS.find((avatar) => avatar.id === storedPresetId) || null;
    const initialProfile = {
      ...getProfileFromUser(user),
      avatar: storedPreset?.src || getProfileFromUser(user).avatar,
    };
    setSelectedPresetId(storedPresetId);
    if (storedPreset?.src && user?.avatar !== storedPreset.src) {
      updateUserSession({ avatar: storedPreset.src });
    }
    setSavedProfile(initialProfile);
    setForm({
      ...initialProfile,
      avatarPreview: initialProfile.avatar,
      avatarFile: null,
      avatarPreset: null,
      avatarAction: 'keep'
    });
    setPasswordForm({ current: '', next: '', confirm: '' });
    setErrors({});
    setSaveState({ type: 'idle', message: '' });

    const timer = setTimeout(() => setIsInitialLoading(false), 350);
    return () => clearTimeout(timer);
  }, [updateUserSession, user?.id, user?.name, user?.email, user?.avatar, user?.phone, user?.username]);

  useEffect(() => {
    if (!location.hash) return;
    const sectionMap = {
      '#password': passwordSectionRef.current
    };

    const target = sectionMap[location.hash];
    if (target) {
      if (location.hash === '#password') setIsPasswordModalOpen(true);
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [location.hash]);

  const avatarCandidate =
    form.avatarAction === 'remove'
      ? ''
      : form.avatarPreview || resolveImageUrl(savedProfile.avatar) || '';
  const isGeneratedPlaceholderAvatar = (() => {
    try {
      return /(?:^|\.)ui-avatars\.com$/i.test(new URL(avatarCandidate).hostname);
    } catch {
      return false;
    }
  })();
  const displayedAvatar = avatarCandidate && !isGeneratedPlaceholderAvatar
    ? avatarCandidate
    : defaultBoyAvatar;

  const hasAvatarChanges = form.avatarAction !== 'keep';
  const hasProfileChanges =
    form.fullName.trim() !== savedProfile.fullName ||
    form.username.trim() !== savedProfile.username ||
    form.email.trim().toLowerCase() !== savedProfile.email ||
    form.phone.trim() !== savedProfile.phone ||
    hasAvatarChanges;
  const isDirty = hasProfileChanges;

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_AVATAR_TYPES.includes(file.type.toLowerCase())) {
      setErrors((prev) => ({ ...prev, avatar: text.invalidImageType }));
      return;
    }

    if (file.size > MAX_AVATAR_FILE_SIZE) {
      setErrors((prev) => ({ ...prev, avatar: text.invalidImageSize }));
      return;
    }

    const nextPreview = URL.createObjectURL(file);
    setSelectedPresetId('');
    if (user?.id) localStorage.removeItem(getSelectedAvatarStorageKey(user.id));
    setForm((prev) => ({ ...prev, avatarPreview: nextPreview, avatarFile: file, avatarPreset: null, avatarAction: 'update' }));
    setErrors((prev) => ({ ...prev, avatar: '' }));
  };

  const handleRemoveAvatar = () => {
    setSelectedPresetId('');
    if (user?.id) localStorage.removeItem(getSelectedAvatarStorageKey(user.id));
    setForm((prev) => ({ ...prev, avatarPreview: '', avatarFile: null, avatarPreset: null, avatarAction: 'remove' }));
    setErrors((prev) => ({ ...prev, avatar: '' }));
  };

  const handlePresetAvatarSelect = async (avatar) => {
    if (!user?.id || isAvatarSaving) return;

    const previousPresetId = selectedPresetId;
    setSelectedPresetId(avatar.id);
    localStorage.setItem(getSelectedAvatarStorageKey(user.id), avatar.id);
    setForm((prev) => ({
      ...prev,
      avatarPreview: avatar.src,
      avatarFile: null,
      avatarPreset: avatar,
      avatarAction: 'update'
    }));
    setErrors((prev) => ({ ...prev, avatar: '' }));

    setIsAvatarSaving(true);
    try {
      const response = await fetch(avatar.src);
      if (!response.ok) throw new Error(avatarPickerText.error);
      const blob = await response.blob();
      const avatarFile = new File([blob], avatar.filename, {
        type: blob.type || 'image/png'
      });

      const updatedUser = await updateUserAvatar(user.id, avatarFile, user);
      const savedAvatar = updatedUser?.avatar || avatar.src;
      updateUserSession({ avatar: savedAvatar });
      setSavedProfile((prev) => ({ ...prev, avatar: savedAvatar }));
      setForm((prev) => ({
        ...prev,
        avatarPreview: savedAvatar,
        avatarFile: null,
        avatarPreset: avatar,
        avatarAction: 'keep'
      }));
      localStorage.setItem(getSelectedAvatarStorageKey(user.id), avatar.id);
      addToast(avatarPickerText.saved, 'success');
    } catch (error) {
      setSelectedPresetId(previousPresetId);
      if (previousPresetId) {
        localStorage.setItem(getSelectedAvatarStorageKey(user.id), previousPresetId);
      } else {
        localStorage.removeItem(getSelectedAvatarStorageKey(user.id));
      }
      setForm((prev) => ({
        ...prev,
        avatarPreview: savedProfile.avatar,
        avatarFile: null,
        avatarPreset: null,
        avatarAction: 'keep'
      }));
      addToast(error?.message || avatarPickerText.error, 'error');
    } finally {
      setIsAvatarSaving(false);
    }
  };

  const handleCancel = () => {
    setSelectedPresetId(user?.id ? localStorage.getItem(getSelectedAvatarStorageKey(user.id)) || '' : '');
    setForm({
      ...savedProfile,
      avatarPreview: savedProfile.avatar,
      avatarFile: null,
      avatarPreset: null,
      avatarAction: 'keep'
    });
    setPasswordForm({ current: '', next: '', confirm: '' });
    setErrors({});
    setSaveState({ type: 'idle', message: '' });
  };

  const validateForm = () => {
    const validationErrors = {};
    const fullName = form.fullName.trim();
    const username = form.username.trim();
    const email = form.email.trim().toLowerCase();
    const phone = form.phone.trim();

    if (!fullName) validationErrors.fullName = text.validationRequired;
    else if (fullName.length < 3) validationErrors.fullName = text.validationNameMin;
    else if (fullName.length > 60) validationErrors.fullName = text.validationNameMax;

    if (username && !usernameRegex.test(username)) {
      validationErrors.username = text.validationUsername;
    }

    if (!email) validationErrors.email = text.validationRequired;
    else if (!emailRegex.test(email)) validationErrors.email = text.validationEmail;

    if (phone && validatePhone(phone)) validationErrors.phone = text.validationPhone;

    return validationErrors;
  };

  const handleSave = async () => {
    if (!user?.id) return;

    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setSaveState({ type: 'error', message: text.saveError });
      addToast(text.saveError, 'error');
      return;
    }

    setIsSaving(true);
    setSaveState({ type: 'saving', message: '' });

    const trimmedProfile = {
      fullName: form.fullName.trim(),
      username: form.username.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim()
    };

    try {
      const profilePayload = {
        name: trimmedProfile.fullName,
        email: trimmedProfile.email,
        username: trimmedProfile.username,
        phone: trimmedProfile.phone
      };

      if (hasAvatarChanges) {
        // Send File object for upload, or null for removal
        let avatarPayload = form.avatarAction === 'remove' ? null : form.avatarFile;
        if (form.avatarAction === 'update' && !avatarPayload && form.avatarPreset) {
          const response = await fetch(form.avatarPreset.src);
          if (!response.ok) throw new Error(text.saveError);
          const blob = await response.blob();
          avatarPayload = new File([blob], form.avatarPreset.filename, {
            type: blob.type || 'image/png'
          });
        }
        await updateUserAvatar(user.id, avatarPayload, user);
        if (!form.avatarPreset) {
          localStorage.removeItem(getSelectedAvatarStorageKey(user.id));
          setSelectedPresetId('');
        }
      }

      await updateUserProfile(user.id, profilePayload, user);

      const nextAvatarValue = hasAvatarChanges
        ? form.avatarAction === 'remove'
          ? ''
          : form.avatarPreview
        : savedProfile.avatar;

      updateUserSession({
        name: profilePayload.name,
        email: profilePayload.email,
        username: profilePayload.username,
        phone: profilePayload.phone,
        avatar: nextAvatarValue
      });

      const nextSaved = {
        fullName: trimmedProfile.fullName,
        username: trimmedProfile.username,
        email: trimmedProfile.email,
        phone: trimmedProfile.phone,
        avatar: nextAvatarValue
      };

      setSavedProfile(nextSaved);
      setForm({
        ...nextSaved,
        avatarPreview: nextSaved.avatar,
        avatarFile: null,
        avatarPreset: null,
        avatarAction: 'keep'
      });
      setPasswordForm({ current: '', next: '', confirm: '' });
      setErrors({});
      setSaveState({ type: 'success', message: text.saveSuccess });
      addToast(text.saveSuccess, 'success');
    } catch (error) {
      const message = error?.message || text.saveError;
      setSaveState({ type: 'error', message });
      addToast(message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordSave = async () => {
    if (!user?.id || isSaving) return;

    const validationErrors = {};
    if (!passwordForm.current) validationErrors.currentPassword = text.validationCurrentPassword;
    if (!passwordForm.next) validationErrors.nextPassword = text.validationRequired;
    else if (passwordForm.next.length < 8) validationErrors.nextPassword = text.validationPasswordLength;
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordForm.next)) {
      validationErrors.nextPassword = text.validationPasswordPattern;
    }
    if (passwordForm.confirm !== passwordForm.next) {
      validationErrors.confirmPassword = text.validationPasswordMatch;
    }

    setErrors((prev) => ({
      ...prev,
      currentPassword: validationErrors.currentPassword || '',
      nextPassword: validationErrors.nextPassword || '',
      confirmPassword: validationErrors.confirmPassword || '',
    }));
    if (Object.keys(validationErrors).length > 0) return;

    try {
      setIsSaving(true);
      await updateUserProfile(user.id, { password: passwordForm.next }, user);
      setPasswordForm({ current: '', next: '', confirm: '' });
      setShowPassword({ current: false, next: false, confirm: false });
      setIsPasswordModalOpen(false);
      addToast(isEnglish ? 'Password changed successfully.' : 'تم تغيير كلمة المرور بنجاح.', 'success');
    } catch (error) {
      addToast(error?.message || text.saveError, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (!isDirty) return;
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  if (isInitialLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-4">
        <div className="h-52 animate-pulse rounded-2xl border border-[color:rgb(var(--color-border-rgb)/0.9)] bg-[color:rgb(var(--color-card-rgb)/0.9)]" />
        <div className="h-64 animate-pulse rounded-2xl border border-[color:rgb(var(--color-border-rgb)/0.9)] bg-[color:rgb(var(--color-card-rgb)/0.9)]" />
      </div>
    );
  }

  const emailVerified = Boolean(user?.emailVerified ?? true);

  return (
    <div className="mx-auto max-w-5xl space-y-4 pb-24">
      {isDirty ? (
        <div className="rounded-xl border border-amber-400/25 bg-amber-500/10 p-3 text-sm text-amber-800 dark:text-amber-200">
          {text.unsavedAlert}
        </div>
      ) : null}

      {saveState.message ? (
        <div
          className={`rounded-xl border p-3 text-sm ${
            saveState.type === 'success'
              ? 'border-emerald-400/25 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200'
              : saveState.type === 'error'
                ? 'border-rose-400/25 bg-rose-500/10 text-rose-800 dark:text-rose-200'
                : 'border-[color:rgb(var(--color-border-rgb)/0.9)] bg-[color:rgb(var(--color-card-rgb)/0.88)] text-[var(--color-text-secondary)]'
          }`}
        >
          {saveState.message}
        </div>
      ) : null}

      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="rounded-2xl border border-[color:rgb(var(--color-border-rgb)/0.9)] bg-[color:rgb(var(--color-card-rgb)/0.9)] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-semibold text-[var(--color-text)]">
              <UserCircle2 className="h-[18px] w-[18px] text-[var(--color-primary)]" />
              {text.profileTitle}
            </h2>
            <Badge variant="success">{text.activeAccount}</Badge>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <img
              src={displayedAvatar}
              alt={form.fullName || text.pageTitle}
              onError={(event) => {
                if (event.currentTarget.src !== defaultBoyAvatar) {
                  event.currentTarget.src = defaultBoyAvatar;
                }
              }}
              className="h-20 w-20 rounded-full border border-[color:rgb(var(--color-border-rgb)/0.88)] object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-lg font-semibold text-[var(--color-text)]">{form.fullName || '---'}</p>
              <p className="truncate text-sm text-[var(--color-text-secondary)]">{form.email || '---'}</p>
              <p className="mt-2 text-xs text-[var(--color-muted)]">{text.imageHint}</p>
              {errors.avatar ? <p className="mt-2 text-xs text-rose-600 dark:text-rose-300">{errors.avatar}</p> : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarChange}
              />
              <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()}>
                <Camera className="h-4 w-4" />
                {text.changePhoto}
              </Button>
              {(form.avatarPreview || savedProfile.avatar) ? (
                <Button type="button" variant="outline" onClick={handleRemoveAvatar}>
                  <X className="h-4 w-4" />
                  {text.removePhoto}
                </Button>
              ) : null}
            </div>
          </div>

          <div className="mt-5 border-t border-[color:rgb(var(--color-border-rgb)/0.72)] pt-4">
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-[var(--color-text)]">{avatarPickerText.title}</h3>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-[var(--color-muted)]">
                {isAvatarSaving ? <LoaderCircle className="h-3.5 w-3.5 animate-spin text-amber-500" /> : null}
                {isAvatarSaving ? avatarPickerText.saving : avatarPickerText.hint}
              </p>
            </div>
            <div className="grid grid-cols-5 gap-2.5 sm:flex sm:flex-wrap sm:gap-3">
              {PRESET_AVATARS.map((avatar, index) => {
                const isSelected = selectedPresetId === avatar.id;
                return (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => handlePresetAvatarSelect(avatar)}
                    disabled={isAvatarSaving}
                    aria-label={`${avatarPickerText.title} ${index + 1}`}
                    aria-pressed={isSelected}
                    className={`group relative aspect-square min-w-0 overflow-hidden rounded-2xl border-2 bg-[var(--color-surface)] p-0.5 transition duration-200 hover:-translate-y-0.5 hover:border-amber-400/80 hover:shadow-[0_8px_24px_rgba(245,158,11,0.18)] disabled:cursor-wait disabled:opacity-60 sm:h-[76px] sm:w-[76px] ${
                      isSelected
                        ? 'border-amber-400 shadow-[0_0_0_3px_rgba(245,158,11,0.16),0_8px_28px_rgba(245,158,11,0.22)]'
                        : 'border-[color:rgb(var(--color-border-rgb)/0.85)]'
                    }`}
                  >
                    <img
                      src={avatar.src}
                      alt={`${avatarPickerText.title} ${index + 1}`}
                      className="h-full w-full rounded-[13px] object-cover transition duration-300 group-hover:scale-105"
                    />
                    {isSelected ? (
                      <span className="absolute end-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full bg-amber-400 text-zinc-950 shadow-lg">
                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        </Card>
      </motion.section>

      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="rounded-2xl border border-[color:rgb(var(--color-border-rgb)/0.9)] bg-[color:rgb(var(--color-card-rgb)/0.9)] p-5">
          <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-[var(--color-text)]">
            <User className="h-[18px] w-[18px] text-[var(--color-primary)]" />
            {text.personalInfo}
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label={text.fullName}
              value={form.fullName}
              onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))}
              error={errors.fullName}
              placeholder={isEnglish ? 'Enter full name' : 'أدخل الاسم الكامل'}
            />
            <Input
              label={text.username}
              value={form.username}
              onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
              error={errors.username}
              placeholder={isEnglish ? 'Optional username' : 'اسم عرض اختياري'}
            />
          </div>
        </Card>
      </motion.section>

      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="rounded-2xl border border-[color:rgb(var(--color-border-rgb)/0.9)] bg-[color:rgb(var(--color-card-rgb)/0.9)] p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-base font-semibold text-[var(--color-text)]">
              <Mail className="h-[18px] w-[18px] text-[var(--color-primary)]" />
              {text.contactInfo}
            </h2>
            <Badge variant={emailVerified ? 'success' : 'warning'}>
              {emailVerified ? text.emailVerified : text.emailNotVerified}
            </Badge>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label={text.emailAddress}
              type="email"
              value={form.email}
              readOnly
              aria-readonly="true"
              className="cursor-not-allowed select-text bg-[color:rgb(var(--color-border-rgb)/0.18)] opacity-75 focus:border-[color:rgb(var(--color-border-rgb)/0.78)] focus:ring-0"
              error={errors.email}
              placeholder={isEnglish ? 'name@example.com' : 'name@example.com'}
            />
            <Input
              label={text.phoneNumber}
              value={form.phone}
              onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              dir="ltr"
              error={errors.phone}
              placeholder={isEnglish ? '+1 555 123 4567' : '+20 100 123 4567'}
            />
          </div>
          <p className="mt-3 text-xs text-[var(--color-muted)]">{text.email2faHint}</p>
        </Card>
      </motion.section>

      <SaveChangesBar
        isDirty={isDirty}
        isSaving={isSaving}
        onSave={handleSave}
        onCancel={handleCancel}
        saveLabel={text.saveLabel}
        cancelLabel={text.cancelLabel}
        dirtyHint={text.dirtyHint}
        cleanHint={text.cleanHint}
      />

      <motion.section ref={passwordSectionRef} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center">
        <Button type="button" variant="outline" onClick={() => setIsPasswordModalOpen(true)}>
          <KeyRound className="h-4 w-4" />
          {text.passwordCard}
        </Button>
      </motion.section>

      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => !isSaving && setIsPasswordModalOpen(false)}
        title={text.passwordCard}
      >
        <div className="space-y-4">
          {[
            { key: 'current', label: text.currentPassword, error: errors.currentPassword },
            { key: 'next', label: text.newPassword, error: errors.nextPassword },
            { key: 'confirm', label: text.confirmPassword, error: errors.confirmPassword }
          ].map((item) => (
            <div key={item.key}>
              <label className="mb-1.5 block text-sm font-medium text-[var(--color-text-secondary)]">{item.label}</label>
              <div className="relative">
                <input
                  type={showPassword[item.key] ? 'text' : 'password'}
                  value={passwordForm[item.key]}
                  onChange={(event) => setPasswordForm((prev) => ({ ...prev, [item.key]: event.target.value }))}
                  className={`${inputBaseClassName} pl-10 ${item.error ? 'border-[color:rgb(var(--color-error-rgb)/0.85)]' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => ({ ...prev, [item.key]: !prev[item.key] }))}
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded p-1 text-[var(--color-muted)] hover:text-[var(--color-text)]"
                >
                  {showPassword[item.key] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {item.error ? <p className="mt-1 text-xs text-rose-600 dark:text-rose-300">{item.error}</p> : null}
            </div>
          ))}
          <p className="text-xs leading-5 text-[var(--color-muted)]">{text.passwordHint}</p>
          <div className="flex justify-end gap-2 border-t border-[color:rgb(var(--color-border-rgb)/0.75)] pt-4">
            <Button type="button" variant="ghost" onClick={() => setIsPasswordModalOpen(false)} disabled={isSaving}>
              {text.cancelLabel}
            </Button>
            <Button type="button" onClick={handlePasswordSave} disabled={isSaving}>
              {isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {isEnglish ? 'Save password' : 'حفظ كلمة المرور'}
            </Button>
          </div>
        </div>
      </Modal>

      <div className="h-3" />
      <div className="hidden items-center gap-2 text-xs text-gray-500">
        <ShieldCheck className="h-3.5 w-3.5" />
        <Mail className="h-3.5 w-3.5" />
        <Phone className="h-3.5 w-3.5" />
        <Save className="h-3.5 w-3.5" />
      </div>
    </div>
  );
};

export default Account;
