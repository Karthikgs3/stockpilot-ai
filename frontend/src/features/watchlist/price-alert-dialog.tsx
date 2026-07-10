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
import { Select } from "@/components/ui/select";
import { getApiErrorMessage } from "@/lib/api-error";
import { watchlistApi } from "@/lib/watchlist-api";
import { WatchlistItemWithQuote } from "@/types/watchlist";

const alertSchema = z.object({
  condition: z.enum(["ABOVE", "BELOW"]),
  target_price: z.coerce.number().positive("Must be greater than 0"),
});

type AlertForm = z.infer<typeof alertSchema>;

interface PriceAlertDialogProps {
  item: WatchlistItemWithQuote | null;
  onClose: () => void;
}

export function PriceAlertDialog({ item, onClose }: PriceAlertDialogProps) {
  const queryClient = useQueryClient();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AlertForm>({
    resolver: zodResolver(alertSchema),
    defaultValues: { condition: "ABOVE" },
  });

  const mutation = useMutation({
    mutationFn: (values: AlertForm) =>
      watchlistApi.createAlert({ watchlist_item_id: item!.id, ...values }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
      reset();
      onClose();
    },
    onError: (err) => setApiError(getApiErrorMessage(err, "Could not create alert.")),
  });

  const handleClose = () => {
    reset();
    setApiError(null);
    onClose();
  };

  return (
    <Dialog
      open={Boolean(item)}
      onClose={handleClose}
      title={`Price alert${item ? ` — ${item.symbol}` : ""}`}
      description="You'll be notified when the price crosses this level."
    >
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
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="condition">Condition</Label>
            <Select id="condition" {...register("condition")}>
              <option value="ABOVE">Price goes above</option>
              <option value="BELOW">Price goes below</option>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="target_price">Target price</Label>
            <Input
              id="target_price"
              type="number"
              step="any"
              hasError={Boolean(errors.target_price)}
              {...register("target_price")}
            />
            {errors.target_price && (
              <p className="text-xs text-loss">{errors.target_price.message}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={mutation.isPending}>
            Create alert
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
