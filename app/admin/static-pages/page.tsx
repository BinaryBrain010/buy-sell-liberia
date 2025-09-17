"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "@/app/services/BaseService";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";

const ALLOWED = [
  { value: "about", label: "About" },
  { value: "contact", label: "Contact" },
  { value: "help", label: "Help" },
  { value: "safety", label: "Safety Tips" },
  { value: "terms", label: "Terms" },
  { value: "privacy", label: "Privacy" },
  { value: "faq", label: "FAQ" },
  { value: "disclaimer", label: "Disclaimer" },
];

type PagePayload = {
  exists?: boolean;
  slug?: string;
  title?: string;
  content?: string;
  data?: any;
  createdAt?: string;
  updatedAt?: string;
};

export default function AdminStaticPages() {
  const [slug, setSlug] = useState<string>(ALLOWED[0].value);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [jsonText, setJsonText] = useState<string>("");
  const [exists, setExists] = useState<boolean>(false);
  const { toast } = useToast();

  const parsedData = useMemo(() => {
    if (!jsonText.trim()) return undefined;
    try {
      return JSON.parse(jsonText);
    } catch (e) {
      return Symbol("invalid-json");
    }
  }, [jsonText]);

  async function load() {
    setLoading(true);
    try {
      const res = await axios.get<PagePayload>(`/pages/${slug}`);
      const data = res.data;
      if (data && (data as any).exists === false) {
        setExists(false);
        setTitle("");
        setContent("");
        setJsonText("");
      } else {
        setExists(true);
        setTitle(data.title || "");
        setContent(data.content || "");
        setJsonText(
          data.data !== undefined && data.data !== null
            ? JSON.stringify(data.data, null, 2)
            : ""
        );
      }
    } catch (e: any) {
      toast({
        title: "Load failed",
        description: e?.response?.data?.error || e.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  async function createPage() {
    if (!title.trim()) {
      toast({
        title: "Validation",
        description: "Title is required",
        variant: "destructive",
      });
      return;
    }
    if (!content.trim() && parsedData === undefined) {
      toast({
        title: "Validation",
        description: "Provide content or data JSON",
        variant: "destructive",
      });
      return;
    }
    if (
      parsedData === (Symbol.for as any)("invalid-json") ||
      parsedData === (Symbol as any)("invalid-json")
    ) {
      toast({
        title: "Invalid JSON",
        description: "Fix the JSON in Data tab before saving",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      const body: any = { title };
      if (content.trim()) body.content = content;
      if (parsedData !== undefined) body.data = parsedData;
      const res = await axios.post(`/admin/static-pages/${slug}`, body);
      toast({
        title: "Created",
        description: res.data?.message || "Page created",
      });
      await load();
    } catch (e: any) {
      toast({
        title: "Create failed",
        description: e?.response?.data?.error || e.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function updatePage() {
    if (
      parsedData === (Symbol.for as any)("invalid-json") ||
      parsedData === (Symbol as any)("invalid-json")
    ) {
      toast({
        title: "Invalid JSON",
        description: "Fix the JSON in Data tab before saving",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      const body: any = {};
      if (title.trim()) body.title = title;
      body.content = content; // allow empty string to clear if desired
      body.data = parsedData === undefined ? undefined : parsedData; // allow null to clear
      const res = await axios.patch(`/admin/static-pages/${slug}`, body);
      toast({
        title: "Updated",
        description: res.data?.message || "Page updated",
      });
      await load();
    } catch (e: any) {
      toast({
        title: "Update failed",
        description: e?.response?.data?.error || e.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function deletePage() {
    if (!exists) return;
    if (!confirm(`Delete page '${slug}'? This cannot be undone.`)) return;
    setLoading(true);
    try {
      const res = await axios.delete(`/admin/static-pages/${slug}`);
      toast({
        title: "Deleted",
        description: res.data?.message || "Page deleted",
      });
      await load();
    } catch (e: any) {
      toast({
        title: "Delete failed",
        description: e?.response?.data?.error || e.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <Card className="border-0 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl">Static Pages Manager</CardTitle>
            <p className="text-sm text-muted-foreground">
              Create, update, and delete content for system pages.
            </p>
          </div>
          <div className="min-w-[220px]">
            <Select value={slug} onValueChange={setSlug} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Select page" />
              </SelectTrigger>
              <SelectContent>
                {ALLOWED.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">
              Content (HTML or Markdown)
            </label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              disabled={loading}
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Data (JSON, optional)</label>
            <Textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              rows={10}
              disabled={loading}
            />
            {jsonText.trim() && parsedData instanceof Symbol && (
              <p className="text-sm text-red-600">Invalid JSON</p>
            )}
          </div>
        </CardContent>
        <Separator />
        <CardFooter className="flex items-center justify-between gap-2 flex-wrap">
          <div className="text-sm text-muted-foreground">
            {exists ? (
              <span>Page exists. Last load reflects current values.</span>
            ) : (
              <span>Page doesn't exist yet. Fill fields and click Create.</span>
            )}
          </div>
          <div className="flex gap-2">
            {!exists ? (
              <Button onClick={createPage} disabled={loading}>
                Create
              </Button>
            ) : (
              <>
                <Button variant="secondary" onClick={load} disabled={loading}>
                  Reload
                </Button>
                <Button onClick={updatePage} disabled={loading}>
                  Save
                </Button>
                <Button
                  variant="destructive"
                  onClick={deletePage}
                  disabled={loading}
                >
                  Delete
                </Button>
              </>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
