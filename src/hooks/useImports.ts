import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

type Import = Tables<"imports">;
type ImportInsert = TablesInsert<"imports">;

export const useImports = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["imports", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("imports")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Import[];
    },
    enabled: !!user,
  });
};

export const useCreateImport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (importData: Omit<ImportInsert, "couple_id">) => {
      // Get couple_id from profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("couple_id")
        .single();

      if (!profile?.couple_id) throw new Error("Couple not found");

      const { data, error } = await supabase
        .from("imports")
        .insert({
          ...importData,
          couple_id: profile.couple_id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Import;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["imports"] });
    },
  });
};

export const useUpdateImportStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      transactions_count,
      error_message,
    }: {
      id: string;
      status: Import["status"];
      transactions_count?: number;
      error_message?: string;
    }) => {
      const { data, error } = await supabase
        .from("imports")
        .update({
          status,
          transactions_count,
          error_message,
          processed_at: status === "completed" || status === "failed" ? new Date().toISOString() : null,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Import;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["imports"] });
    },
  });
};

export const useUploadFile = () => {
  return useMutation({
    mutationFn: async ({
      file,
      coupleId,
      type,
    }: {
      file: File;
      coupleId: string;
      type: "print" | "ofx";
    }) => {
      const folder = type === "print" ? "prints" : "ofx";
      const fileName = `${coupleId}/${folder}/${Date.now()}-${file.name}`;

      const { data, error } = await supabase.storage
        .from("uploads")
        .upload(fileName, file);

      if (error) throw error;

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from("uploads")
        .getPublicUrl(data.path);

      return {
        path: data.path,
        url: urlData.publicUrl,
      };
    },
  });
};
