import { useState, useRef } from 'react';
import {
  Camera, Mail, Phone, MapPin,
  User, Briefcase, Calendar,
  Shield, Pencil, X, Check, AlertCircle, Loader2
} from 'lucide-react';
import { useProfile, useUpdateProfile } from '../../hooks/useProfile';
import AvatarCropModal from '../../components/portal/AvatarCropModal';

// ─── InfoRow ─────────────────────────────────────────────────
function InfoRow({
  icon: Icon, label, value, readOnly = false,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  readOnly?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-gray-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 mb-0.5">{label}</p>
        <p className={`text-sm ${readOnly ? 'text-gray-400' : 'text-gray-900 font-medium'}`}>
          {value}
        </p>
      </div>
      {readOnly && (
        <span
          title="Contact HR to update this field."
          className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full self-center flex-shrink-0 cursor-help"
        >
          HR only
        </span>
      )}
    </div>
  );
}

// ─── SectionCard ─────────────────────────────────────────────
function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-5 py-3.5 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-700">{title}</h2>
      </div>
      <div className="px-5">{children}</div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────
function ProfileSkeleton() {
  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-pulse">
      <div className="h-7 w-32 bg-gray-200 rounded" />
      <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-5">
        <div className="w-20 h-20 rounded-full bg-gray-200 flex-shrink-0" />
        <div className="space-y-2 flex-1">
          <div className="h-5 w-40 bg-gray-200 rounded" />
          <div className="h-4 w-28 bg-gray-100 rounded" />
          <div className="h-4 w-20 bg-gray-100 rounded" />
        </div>
      </div>
      {[1, 2].map(i => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
          {[1, 2, 3].map(j => (
            <div key={j} className="h-10 bg-gray-100 rounded" />
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────
export default function ProfilePage() {
  const { data: emp, isLoading, isError, refetch } = useProfile();
  const updateProfile = useUpdateProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [toast,     setToast]     = useState<string | null>(null);
  const [editValues, setEditValues] = useState({
    phoneNumber:      '',
    emergencyContact: '',
    currentAddress:   '',
  });

  // ── Photo upload state ──────────────────────────────────────
  const fileInputRef          = useRef<HTMLInputElement>(null);
  const [cropSrc,  setCropSrc]  = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  // ── Handlers ────────────────────────────────────────────────
  const handleEditOpen = () => {
    if (!emp) return;
    setEditValues({
      phoneNumber:      emp.phoneNumber,
      emergencyContact: emp.emergencyContact,
      currentAddress:   emp.currentAddress,
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    await updateProfile.mutateAsync(editValues);
    setIsEditing(false);
    setToast('Profile updated successfully!');
    setTimeout(() => setToast(null), 3000);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      alert('Only JPG and PNG files are allowed.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be under 2MB.');
      return;
    }

    setCropSrc(URL.createObjectURL(file));
    e.target.value = ''; // reset so same file can be picked again
  };

  const handleCropClose = () => {
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
  };

  const handleUploadSuccess = (newUrl: string) => {
    setPhotoUrl(newUrl);
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
    setToast('Profile photo updated successfully!');
    setTimeout(() => setToast(null), 3000);
  };

  // ── Guards ───────────────────────────────────────────────────
  if (isLoading)           return <ProfileSkeleton />;
  if (!emp && !isError)    return <ProfileSkeleton />;

  if (isError) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex flex-col items-center gap-3 text-center">
          <AlertCircle className="w-8 h-8 text-red-400" />
          <p className="text-sm font-medium text-red-700">Failed to load profile</p>
          <p className="text-xs text-red-500">Could not reach the server. Please try again.</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const initials = emp.fullName.split(' ').map(n => n[0]).join('').slice(0, 2);
  const displayPhoto = photoUrl ?? emp.profilePhotoUrl;

  return (
    <div className="max-w-2xl mx-auto space-y-5">

      {/* Crop modal */}
      {cropSrc && (
        <AvatarCropModal
          imageSrc={cropSrc}
          onClose={handleCropClose}
          onUploadSuccess={handleUploadSuccess}
        />
      )}

      {/* Success toast */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-white border border-green-200 rounded-xl shadow-lg px-5 py-3 flex items-center gap-2">
          <Check className="w-4 h-4 text-green-600" />
          <span className="text-sm font-medium text-gray-800">{toast}</span>
        </div>
      )}

      {/* Page heading */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">My Profile</h1>
        <p className="text-sm text-gray-500 mt-0.5">View and manage your personal information</p>
      </div>

      {/* Profile banner */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-5">

        {/* Avatar + camera button */}
        <div className="relative flex-shrink-0">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png"
            className="hidden"
            onChange={handleFileSelect}
          />

          {/* Avatar circle */}
          <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
            {displayPhoto
              ? <img src={displayPhoto} alt={emp.fullName} className="w-full h-full object-cover" />
              : initials
            }
          </div>

          {/* Camera button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Change profile photo"
            className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 shadow transition-colors"
          >
            <Camera className="w-3 h-3" />
          </button>
        </div>

        {/* Name + badges */}
        <div>
          <h2 className="text-lg font-bold text-gray-900">{emp.fullName}</h2>
          <p className="text-sm text-gray-500">{emp.designation}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-xs bg-blue-50 text-blue-700 font-medium px-2 py-0.5 rounded-full border border-blue-100">
              {emp.employeeId}
            </span>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              {emp.department}
            </span>
          </div>
        </div>

        {/* Edit / Save / Cancel */}
        <div className="ml-auto flex gap-2">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50"
              >
                <X className="w-3.5 h-3.5" /> Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={updateProfile.isPending}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-70"
              >
                {updateProfile.isPending
                  ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...</>
                  : <><Check className="w-3.5 h-3.5" /> Save</>
                }
              </button>
            </>
          ) : (
            <button
              onClick={handleEditOpen}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
            >
              <Pencil className="w-3.5 h-3.5" /> Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Work Information — read only */}
      <SectionCard title="Work Information">
        <InfoRow icon={Briefcase} label="Department"       value={emp.department}  readOnly />
        <InfoRow icon={Shield}    label="Designation"      value={emp.designation} readOnly />
        <InfoRow icon={Shield}    label="Salary Band"      value={emp.salaryBand}  readOnly />
        <InfoRow icon={User}      label="Manager"          value={emp.managerName} readOnly />
        <InfoRow icon={Calendar}  label="Date of Joining"
          value={new Date(emp.dateOfJoining).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'long', year: 'numeric',
          })}
          readOnly
        />
      </SectionCard>

      {/* Contact Information — editable fields */}
      <SectionCard title="Contact Information">
        <InfoRow icon={Mail} label="Work Email" value={emp.workEmail} readOnly />

        {/* Phone */}
        <div className="flex items-start gap-3 py-3 border-b border-gray-100">
          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
            <Phone className="w-4 h-4 text-gray-500" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-500 mb-0.5">Phone Number</p>
            {isEditing ? (
              <input
                value={editValues.phoneNumber}
                onChange={e => setEditValues(v => ({ ...v, phoneNumber: e.target.value }))}
                className="w-full border border-blue-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            ) : (
              <p className="text-sm font-medium text-gray-900">{emp.phoneNumber}</p>
            )}
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="flex items-start gap-3 py-3 border-b border-gray-100">
          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
            <Phone className="w-4 h-4 text-gray-500" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-500 mb-0.5">Emergency Contact</p>
            {isEditing ? (
              <input
                value={editValues.emergencyContact}
                onChange={e => setEditValues(v => ({ ...v, emergencyContact: e.target.value }))}
                className="w-full border border-blue-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            ) : (
              <p className="text-sm font-medium text-gray-900">{emp.emergencyContact}</p>
            )}
          </div>
        </div>

        {/* Address */}
        <div className="flex items-start gap-3 py-3">
          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
            <MapPin className="w-4 h-4 text-gray-500" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-500 mb-0.5">Current Address</p>
            {isEditing ? (
              <textarea
                value={editValues.currentAddress}
                onChange={e => setEditValues(v => ({ ...v, currentAddress: e.target.value }))}
                rows={2}
                className="w-full border border-blue-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
              />
            ) : (
              <p className="text-sm font-medium text-gray-900">{emp.currentAddress}</p>
            )}
          </div>
        </div>
      </SectionCard>

    </div>
  );
}