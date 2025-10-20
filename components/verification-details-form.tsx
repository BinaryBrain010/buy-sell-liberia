import { useState } from "react";

export type VerificationType = "individual" | "business";

interface VerificationDetailsFormProps {
  type: VerificationType;
  onSubmit: (data: any) => Promise<void>;
  loading?: boolean;
}

export default function VerificationDetailsForm({
  type,
  onSubmit,
  loading,
}: VerificationDetailsFormProps) {
  const [form, setForm] = useState<{
    governmentId: string;
    businessDocuments: (File | string)[];
    phone: string;
    email: string;
    profilePicture: File | string | null;
    businessAddress: string;
  }>({
    governmentId: "",
    businessDocuments: [],
    phone: "",
    email: "",
    profilePicture: null,
    businessAddress: "",
  });
  const [errors, setErrors] = useState<string | null>(null);

  const handleChange = (e: any) => {
    const { name, value, files } = e.target;
    if (name === "profilePicture" && files) {
      setForm((f) => ({ ...f, profilePicture: files[0] }));
    } else if (name === "businessDocuments" && files) {
      setForm((f) => ({ ...f, businessDocuments: Array.from(files) }));
    } else if (files) {
      setForm((f) => ({ ...f, [name]: files[0] }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const handleArrayChange = (name: string, value: string[]) => {
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setErrors(null);
    // Validate required fields
    if (type === "individual") {
      if (!form.governmentId || !form.phone || !form.profilePicture) {
        setErrors("Please fill all required fields.");
        return;
      }
    } else if (type === "business") {
      if (
        !form.governmentId ||
        !form.businessDocuments.length ||
        !form.phone ||
        !form.email
      ) {
        setErrors("Please fill all required fields.");
        return;
      }
    }
    // Convert profilePicture and businessDocuments to base64 if present
    let profilePictureData = form.profilePicture;
    if (form.profilePicture && form.profilePicture instanceof File) {
      profilePictureData = await toBase64(form.profilePicture);
    }
    let businessDocumentsData = form.businessDocuments;
    if (Array.isArray(form.businessDocuments)) {
      businessDocumentsData = await Promise.all(
        form.businessDocuments.map((doc) =>
          doc instanceof File ? toBase64(doc) : doc
        )
      );
    }
    await onSubmit({
      ...form,
      profilePicture: profilePictureData,
      businessDocuments: businessDocumentsData,
    });
  };

  function toBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="font-medium">
            Government ID <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="governmentId"
            value={form.governmentId}
            onChange={handleChange}
            className="input w-full"
            required
          />
        </div>
        {type === "business" && (
          <div>
            <label className="font-medium">
              Business Documents <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <label className="inline-block px-4 py-2 bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700 transition font-medium">
                <span>Choose Images</span>
                <input
                  type="file"
                  name="businessDocuments"
                  accept="image/*"
                  multiple
                  onChange={handleChange}
                  className="hidden"
                  required
                />
              </label>
              <span className="text-xs text-gray-500">
                {form.businessDocuments.length > 0
                  ? `${form.businessDocuments.length} file${
                      form.businessDocuments.length > 1 ? "s" : ""
                    } selected`
                  : "No files selected"}
              </span>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {form.businessDocuments.map((file, idx) => (
                <div key={idx} className="relative group">
                  <img
                    src={
                      typeof file === "string"
                        ? file
                        : URL.createObjectURL(file)
                    }
                    alt={`Document ${idx + 1}`}
                    className="h-16 w-16 object-cover rounded border"
                  />
                  <button
                    type="button"
                    className="absolute top-0 right-0 bg-black/60 text-white text-xs px-1 py-0.5 rounded opacity-80 group-hover:opacity-100"
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        businessDocuments: f.businessDocuments.filter(
                          (_, i) => i !== idx
                        ),
                      }))
                    }
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        <div>
          <label className="font-medium">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="input w-full"
            required
          />
        </div>
        {type === "business" && (
          <div>
            <label className="font-medium">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="input w-full"
              required
            />
          </div>
        )}
        {type === "individual" && (
          <div>
            <label className="font-medium">
              Email <span className="text-gray-400">(optional)</span>
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="input w-full"
            />
          </div>
        )}
        <div>
          <label className="font-medium">
            Profile Picture/Selfie{" "}
            {type === "individual" ? (
              <span className="text-red-500">*</span>
            ) : (
              <span className="text-gray-400">(optional)</span>
            )}
          </label>
          <div className="flex items-center gap-2">
            <label className="inline-block px-4 py-2 bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700 transition font-medium">
              <span>Choose Image</span>
              <input
                type="file"
                name="profilePicture"
                accept="image/*"
                onChange={handleChange}
                className="hidden"
                required={type === "individual"}
              />
            </label>
            <span className="text-xs text-gray-500">
              {form.profilePicture
                ? typeof form.profilePicture === "string"
                  ? "Image selected"
                  : (form.profilePicture as File).name
                : "No file selected"}
            </span>
          </div>
          {form.profilePicture && typeof form.profilePicture !== "string" && (
            <div className="mt-2">
              <img
                src={URL.createObjectURL(form.profilePicture)}
                alt="Preview"
                className="h-20 rounded border object-cover"
              />
              <button
                type="button"
                className="ml-2 text-xs text-red-500 underline"
                onClick={() => setForm((f) => ({ ...f, profilePicture: null }))}
              >
                Remove
              </button>
            </div>
          )}
        </div>
        {type === "business" && (
          <div>
            <label className="font-medium">
              Business Address{" "}
              <span className="text-gray-400">(recommended)</span>
            </label>
            <input
              type="text"
              name="businessAddress"
              value={form.businessAddress}
              onChange={handleChange}
              className="input w-full"
            />
          </div>
        )}
      </div>
      {errors && <div className="text-red-500 text-sm mt-2">{errors}</div>}
      <button
        type="submit"
        className="btn btn-primary w-full mt-2"
        disabled={loading}
      >
        Submit Details
      </button>
    </form>
  );
}
