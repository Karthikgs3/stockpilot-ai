"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getApiErrorMessage } from "@/lib/api-error";
import { watchlistApi } from "@/lib/watchlist-api";

const symbolSchema = z.object({
  symbol: z.string().min(1, "Required").max(20),
  company_name: z.string().min(1, "Required").max(255),
});

type SymbolForm = z.infer<typeof symbolSchema>;

interface AddSymbolDialogProps {
  open: boolean;
  onClose: () => void;
}

export function AddSymbolDialog({ open, onClose }: AddSymbolDialogProps) {
  const queryClient = useQueryClient();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SymbolForm>({ resolver: zodResolver(symbolSchema) });

  const mutation = useMutation({
    mutationFn: (values: SymbolForm) => watchlistApi.add(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
      reset();
      onClose();
    },
    onError: (err) => setApiError(getApiErrorMessage(err, "Could not add symbol.")),
  });

  const handleClose = () => {
    reset();
    setApiError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} title="Add to watchlist">
      {apiError && (
        <Alert variant="error" className="mb-4">
          {apiError}
        </Alert>
      )}

      <form
        onSubmit={handleSubmit((v) => {
          setApiError(null);
          mutation.mutate(v);
        })}
        className="space-y-4"
        noValidate
      >
        <div className="space-y-1.5">
          <Label htmlFor="symbol">Symbol</Label>
          <Input
            id="symbol"
            placeholder="MSFT"
            hasError={Boolean(errors.symbol)}
            {...register("symbol")}
          />
          {errors.symbol && <p className="text-xs text-loss">{errors.symbol.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="company_name">Company name</Label>
          <Input
            id="company_name"
            placeholder="Microsoft Corporation"
            hasError={Boolean(errors.company_name)}
            {...register("company_name")}
          />
          {errors.company_name && (
            <p className="text-xs text-loss">{errors.company_name.message}</p>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={mutation.isPending}>
            Add to watchlist
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
