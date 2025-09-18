"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type MappingEntry = { slug: string; url: string; title?: string };

export default function AdminSubcategoryImagesPage() {
  const [rows, setRows] = useState<
    Array<{ slug: string; file?: File | null; title?: string }>
  >([{ slug: "", file: null, title: "" }]);
  const [mapping, setMapping] = useState<MappingEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const token = useMemo(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("accessToken");
  }, []);

  const fetchMapping = async () => {
    try {
      const res = await fetch("/api/subcategory-image-map", {
        cache: "no-store",
      });
      const data = await res.json();
      setMapping(data?.data?.images || []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load mapping");
    }
  };

  useEffect(() => {
    fetchMapping();
  }, []);

  const addRow = () =>
    setRows((r) => [...r, { slug: "", file: null, title: "" }]);
  const removeRow = (idx: number) =>
    setRows((r) => r.filter((_, i) => i !== idx));

  const handleRowChange = (
    idx: number,
    key: "slug" | "file" | "title",
    value: any
  ) => {
    setRows((r) =>
      r.map((row, i) => (i === idx ? { ...row, [key]: value } : row))
    );
  };

  const uploadAll = async () => {
    try {
      if (!token) {
        toast.error("Super admin token missing. Please login as admin.");
        return;
      }
      setLoading(true);
      const form = new FormData();
      const titles: Record<string, string> = {};
      let appended = 0;
      for (const row of rows) {
        if (row.slug && row.file) {
          form.append(row.slug, row.file);
          if (row.title) titles[row.slug] = row.title;
          appended++;
        }
      }
      if (Object.keys(titles).length > 0) {
        form.append("mapping", JSON.stringify(titles));
      }
      if (appended === 0) {
        toast.error("Add at least one slug with a file");
        return;
      }
      const res = await fetch("/api/subcategory-image-map", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Upload failed");
      toast.success("Images saved");
      setRows([{ slug: "", file: null, title: "" }]);
      await fetchMapping();
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const updateOne = async (
    slug: string,
    file?: File | null,
    title?: string
  ) => {
    try {
      if (!token) {
        toast.error("Super admin token missing.");
        return;
      }
      if (!slug) {
        toast.error("Slug required");
        return;
      }
      const form = new FormData();
      form.append("slug", slug);
      if (title !== undefined) form.append("title", title);
      if (file) form.append("image", file);
      const res = await fetch(`/api/subcategory-image-map`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Update failed");
      toast.success("Updated");
      await fetchMapping();
    } catch (e: any) {
      toast.error(e.message || "Update failed");
    }
  };

  const deleteOne = async (slug: string) => {
    try {
      if (!token) {
        toast.error("Super admin token missing.");
        return;
      }
      const res = await fetch(
        `/api/subcategory-image-map?slug=${encodeURIComponent(slug)}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Delete failed");
      toast.success("Deleted");
      await fetchMapping();
    } catch (e: any) {
      toast.error(e.message || "Delete failed");
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold">
            Subcategory Images (Admin)
          </h1>
          <Button onClick={fetchMapping} variant="outline">
            Refresh
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Upload new images</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {rows.map((row, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end"
              >
                <div className="md:col-span-2">
                  <Label htmlFor={`slug-${idx}`}>Slug</Label>
                  <Input
                    id={`slug-${idx}`}
                    value={row.slug}
                    onChange={(e) =>
                      handleRowChange(idx, "slug", e.target.value)
                    }
                    placeholder="e.g. cars"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor={`title-${idx}`}>Title (optional)</Label>
                  <Input
                    id={`title-${idx}`}
                    value={row.title || ""}
                    onChange={(e) =>
                      handleRowChange(idx, "title", e.target.value)
                    }
                    placeholder="Display title"
                  />
                </div>
                <div>
                  <Label htmlFor={`file-${idx}`}>Image</Label>
                  <Input
                    id={`file-${idx}`}
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleRowChange(idx, "file", e.target.files?.[0] || null)
                    }
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => removeRow(idx)}
                    disabled={rows.length === 1}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
            <div className="flex gap-2">
              <Button variant="outline" onClick={addRow}>
                Add Row
              </Button>
              <Button onClick={uploadAll} disabled={loading}>
                {loading ? "Uploading..." : "Save Images"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current mapping</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {mapping.length === 0 ? (
              <p className="text-muted-foreground">No images yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mapping.map((m) => (
                  <div key={m.slug} className="border rounded-md p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{m.slug}</div>
                        {m.title ? (
                          <div className="text-sm text-muted-foreground">
                            {m.title}
                          </div>
                        ) : null}
                      </div>
                      {m.url ? (
                        // Using img to avoid Next/Image config for API route
                        <img
                          src={m.url}
                          alt={m.slug}
                          className="h-16 w-16 object-cover rounded"
                        />
                      ) : null}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
                      <div className="md:col-span-1">
                        <Label htmlFor={`new-title-${m.slug}`}>Title</Label>
                        <Input
                          id={`new-title-${m.slug}`}
                          placeholder={m.title || ""}
                          onBlur={(e) =>
                            updateOne(m.slug, undefined, e.target.value)
                          }
                        />
                      </div>
                      <div className="md:col-span-1">
                        <Label htmlFor={`new-file-${m.slug}`}>
                          Replace image
                        </Label>
                        <Input
                          id={`new-file-${m.slug}`}
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            updateOne(m.slug, e.target.files?.[0] || null)
                          }
                        />
                      </div>
                      <div className="md:col-span-1 flex gap-2">
                        <Button
                          variant="destructive"
                          onClick={() => deleteOne(m.slug)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
