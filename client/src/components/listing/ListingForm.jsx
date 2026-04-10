import { useState } from 'react';
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';
import { app } from '../../firebase';
import { FaTrash, FaQuestion, FaCheckCircle } from 'react-icons/fa';
import { MdOutlineCloudUpload } from 'react-icons/md';
import { toDateInputValue } from '../../utils/timeAgo';

const TYPE_OPTIONS = [
  { id: 'lost',  label: 'Lost',  sub: 'I lost this item',  Icon: FaQuestion,     active: 'border-red-400 bg-red-50 text-red-700'       },
  { id: 'found', label: 'Found', sub: 'I found this item', Icon: FaCheckCircle,  active: 'border-emerald-400 bg-emerald-50 text-emerald-700' },
];

const CATEGORIES = [
  { id: 'clothing',    label: 'Clothing'         },
  { id: 'college',     label: 'College Supplies' },
  { id: 'gadgets',     label: 'Gadgets'          },
  { id: 'books',       label: 'Books'            },
  { id: 'accessories', label: 'Accessories'      },
  { id: 'other',       label: 'Other'            },
];

const CAMPUS_LOCATIONS = [
  'Central Library',
  'A Block',
  'B Block',
  'C Block',
  'Hostel Area',
  'Main Gate',
  'Cafeteria',
  'Sports Complex',
  'Auditorium',
  'Parking Area',
];

export const DEFAULT_FORM = {
  imageUrls:   [],
  name:        '',
  description: '',
  address:     '',
  type:        'found',
  clothing:    false,
  college:     false,
  gadgets:     false,
  books:       false,
  accessories: false,
  other:       false,
  date:        toDateInputValue(new Date()),
  website:     '',
};

export default function ListingForm({
  formData,
  setFormData,
  onSubmit,
  submitLabel = 'Submit',
  loading = false,
}) {
  const [files, setFiles]             = useState([]);
  const [uploading, setUploading]     = useState(false);
  const [uploadProgress, setProgress] = useState({});
  const [uploadError, setUploadError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);

  // ── Image upload ─────────────────────────────────────────────────────────

  const storeImage = (file) =>
    new Promise((resolve, reject) => {
      const storage    = getStorage(app);
      const storageRef = ref(storage, `${Date.now()}_${file.name}`);
      const task       = uploadBytesResumable(storageRef, file);
      task.on(
        'state_changed',
        (snap) => {
          const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
          setProgress((prev) => ({ ...prev, [file.name]: pct }));
        },
        reject,
        () => getDownloadURL(task.snapshot.ref).then(resolve),
      );
    });

  const handleUpload = () => {
    setUploadError('');
    if (!files.length) return;
    if (files.length + formData.imageUrls.length > 6) {
      setUploadError('Maximum 6 images per listing.');
      return;
    }
    setUploading(true);
    const selectedFiles = [...files];
    const invalidType = selectedFiles.some((file) => !file.type.startsWith('image/'));
    if (invalidType) {
      setUploadError('Only image files are supported.');
      return;
    }
    const oversize = selectedFiles.some((file) => file.size > 2 * 1024 * 1024);
    if (oversize) {
      setUploadError('Each image must be under 2 MB.');
      return;
    }
    Promise.all(selectedFiles.map(storeImage))
      .then((urls) => {
        setFormData((f) => ({ ...f, imageUrls: [...f.imageUrls, ...urls] }));
        setProgress({});
        setFiles([]);
        setUploading(false);
      })
      .catch(() => {
        setUploadError('Upload failed. Each image must be under 2 MB.');
        setUploading(false);
      });
  };

  const removeImage = (i) =>
    setFormData((f) => ({ ...f, imageUrls: f.imageUrls.filter((_, idx) => idx !== i) }));

  // ── Field handlers ────────────────────────────────────────────────────────

  const setType     = (type) => setFormData((f) => ({ ...f, type }));
  const toggleCat   = (cat)  => setFormData((f) => ({ ...f, [cat]: !f[cat] }));
  const handleField = (e)    => setFormData((f) => ({ ...f, [e.target.id]: e.target.value }));

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    if (formData.imageUrls.length < 1) {
      setSubmitError('Upload at least one image.');
      return;
    }
    try {
      await onSubmit(formData);
    } catch (err) {
      setSubmitError(err.message || 'Something went wrong.');
    }
  };

  const today = toDateInputValue(new Date());

  const stepTitles = ['Status', 'Details', 'Category', 'Photos'];
  const validateStep = (step) => {
    if (step === 2) {
      if (!formData.name?.trim()) return 'Enter item name.';
      if (!formData.description?.trim()) return 'Enter a description.';
      if (!formData.address?.trim()) return 'Enter location details.';
    }
    if (step === 3) {
      const hasCategory = ['clothing', 'college', 'gadgets', 'books', 'accessories', 'other'].some((key) => formData[key]);
      if (!hasCategory) return 'Select at least one category.';
    }
    if (step === 4 && formData.imageUrls.length < 1) {
      return 'Upload at least one image.';
    }
    return '';
  };

  const goNext = () => {
    const error = validateStep(currentStep);
    if (error) {
      setSubmitError(error);
      return;
    }
    setSubmitError('');
    setCurrentStep((s) => Math.min(4, s + 1));
  };

  const goBack = () => {
    setSubmitError('');
    setCurrentStep((s) => Math.max(1, s - 1));
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8 max-w-2xl mx-auto px-4 py-8">
      <input
        type="text"
        id="website"
        value={formData.website || ''}
        onChange={handleField}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {stepTitles.map((step, idx) => (
          <div key={step} className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-600 flex items-center gap-2">
            <span className={`w-5 h-5 rounded-full text-[10px] inline-flex items-center justify-center font-semibold ${
              currentStep >= idx + 1 ? 'bg-neutral-900 text-white' : 'bg-neutral-200 text-neutral-700'
            }`}>
              {idx + 1}
            </span>
            {step}
          </div>
        ))}
      </div>

      {/* 1. Status */}
      {currentStep === 1 && <section>
        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">
          Status
        </p>
        <div className="grid grid-cols-2 gap-3">
          {TYPE_OPTIONS.map(({ id, label, sub, Icon, active }) => (
            <button
              key={id}
              id={id}
              type="button"
              onClick={() => setType(id)}
              className={`flex flex-col items-center justify-center py-5 rounded-2xl border-2 transition-colors ${
                formData.type === id ? active : 'border-neutral-200 text-neutral-500 hover:border-neutral-300'
              }`}
            >
              <Icon size={20} className="mb-2 opacity-80" />
              <span className="text-base font-bold">{label}</span>
              <span className="text-xs mt-0.5 font-normal opacity-80">{sub}</span>
            </button>
          ))}
        </div>
      </section>}

      {/* 2. Details */}
      {currentStep === 2 && <section className="flex flex-col gap-4">
        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
          Item details
        </p>
        <div>
          <label htmlFor="name" className="text-sm font-medium text-neutral-700 block mb-1">
            Item name
          </label>
          <input
            id="name"
            type="text"
            placeholder="e.g. Black backpack, iPhone 14, Student ID card"
            required
            minLength={3}
            maxLength={62}
            value={formData.name}
            onChange={handleField}
            className="input-field"
          />
        </div>
        <div>
          <label htmlFor="description" className="text-sm font-medium text-neutral-700 block mb-1">
            Description
          </label>
          <textarea
            id="description"
            placeholder="Describe the item: colour, brand, size, any unique features..."
            required
            rows={4}
            value={formData.description}
            onChange={handleField}
            className="input-field resize-none"
          />
        </div>
        <div>
          <label htmlFor="address" className="text-sm font-medium text-neutral-700 block mb-1">
            Location
          </label>
          <input
            id="address"
            type="text"
            placeholder="Where was it lost / found? e.g. Library Block, Cafeteria"
            required
            value={formData.address}
            onChange={handleField}
            className="input-field"
            list="campus-location-options"
          />
          <datalist id="campus-location-options">
            {CAMPUS_LOCATIONS.map((location) => (
              <option key={location} value={location} />
            ))}
          </datalist>
          <div className="flex flex-wrap gap-2 mt-2">
            {CAMPUS_LOCATIONS.slice(0, 6).map((location) => (
              <button
                key={location}
                type="button"
                onClick={() => setFormData((f) => ({ ...f, address: location }))}
                className="text-xs px-2.5 py-1 rounded-full border border-neutral-200 text-neutral-600 hover:border-neutral-400 hover:text-neutral-900 transition-colors"
              >
                {location}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label htmlFor="date" className="text-sm font-medium text-neutral-700 block mb-1">
            Date {formData.type === 'lost' ? 'lost' : 'found'}
          </label>
          <input
            id="date"
            type="date"
            max={today}
            value={formData.date}
            onChange={handleField}
            className="input-field"
          />
        </div>
      </section>}

      {/* 3. Category */}
      {currentStep === 3 && <section>
        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">
          Category <span className="normal-case font-normal text-neutral-400">(select all that apply)</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(({ id, label }) => (
            <button
              key={id}
              id={id}
              type="button"
              onClick={() => toggleCat(id)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                formData[id]
                  ? 'bg-neutral-100 border-neutral-600 text-neutral-900'
                  : 'border-neutral-200 text-neutral-600 hover:border-neutral-400'
              }`}
            >
              {label}
              {formData[id] && <span className="ml-1.5 text-neutral-600">&#10003;</span>}
            </button>
          ))}
        </div>
      </section>}

      {/* 4. Photos */}
      {currentStep === 4 && <section className="flex flex-col gap-3">
        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
          Photos <span className="normal-case font-normal text-neutral-400">(up to 6, max 2 MB each, first is cover)</span>
        </p>

        <div className="flex gap-3 items-start">
          <label
            htmlFor="images"
            className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-neutral-300 rounded-2xl py-7 cursor-pointer hover:border-neutral-600 hover:bg-neutral-100 transition-colors"
          >
            <MdOutlineCloudUpload size={30} className="text-neutral-400 mb-2" />
            <span className="text-sm text-neutral-500 font-medium">Click to select images</span>
            <span className="text-xs text-neutral-400 mt-1">
              {files.length
                ? `${files.length} file${files.length > 1 ? 's' : ''} selected`
                : 'PNG, JPG up to 2 MB'}
            </span>
            <input
              id="images"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => setFiles(e.target.files)}
            />
          </label>
          <button
            id="uploadBtn"
            type="button"
            onClick={handleUpload}
            disabled={uploading || !files.length}
            className="px-5 py-2.5 bg-neutral-900 text-white rounded-xl text-sm font-medium hover:bg-neutral-950 transition-colors disabled:opacity-50 self-center"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>

        {uploadError && <p className="text-sm text-red-600">{uploadError}</p>}

        {/* Per-file progress bars */}
        {uploading && Object.entries(uploadProgress).map(([name, pct]) => (
          <div key={name} className="text-xs text-neutral-500">
            <div className="flex justify-between mb-1">
              <span className="truncate max-w-[220px]">{name}</span>
              <span>{pct}%</span>
            </div>
            <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-neutral-600 rounded-full transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        ))}

        {/* Preview grid */}
        {formData.imageUrls.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {formData.imageUrls.map((url, i) => (
              <div key={url} className="relative group rounded-xl overflow-hidden border border-neutral-200 aspect-square">
                <img src={url} alt="" className="w-full h-full object-cover" />
                {i === 0 && (
                  <span className="absolute top-1 left-1 bg-neutral-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                    Cover
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  aria-label="Remove image"
                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  <FaTrash size={14} className="text-white" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>}

      {/* Submit */}
      {submitError && <p className="text-sm text-red-600">{submitError}</p>}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={goBack}
          disabled={currentStep === 1}
          className="btn-ghost disabled:opacity-50"
        >
          Back
        </button>
        {currentStep < 4 ? (
          <button type="button" onClick={goNext} className="btn-primary">
            Next
          </button>
        ) : (
          <button
            id="createPostBtn"
            type="submit"
            disabled={loading || uploading}
            className="btn-primary disabled:opacity-60"
          >
            {loading ? 'Saving...' : submitLabel}
          </button>
        )}
      </div>
    </form>
  );
}
