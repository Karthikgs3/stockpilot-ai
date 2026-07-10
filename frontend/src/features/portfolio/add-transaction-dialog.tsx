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
import { portfolioApi } from "@/lib/portfolio-api";

const transactionSchema = z.object({
  symbol: z.string().min(1, "Required").max(20),
  company_name: z.string().min(1, "Required").max(255),
  sector: z.string().max(100).optional(),
  transaction_type: z.enum(["BUY", "SELL"]),
  quantity: z.coerce.number().positive("Must be greater than 0"),
  price_per_share: z.coerce.number().positive("Must be greater than 0"),
  fees: z.coerce.number().min(0).optional(),
  executed_at: z.string().min(1, "Required"),
});

type TransactionForm = z.infer<typeof transactionSchema>;

const SECTORS = [
  "Technology",
  "Healthcare",
  "Financials",
  "Consumer Discretionary",
  "Consumer Staples",
  "Energy",
  "Industrials",
  "Utilities",
  "Real Estate",
  "Materials",
  "Communication Services",
];

interface AddTransactionDialogProps {
  open: boolean;
  onClose: () => void;
}

export function AddTransactionDialog({ open, onClose }: AddTransactionDialogProps) {
  const queryClient = useQueryClient();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TransactionForm>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      transaction_type: "BUY",
      executed_at: new Date().toISOString().slice(0, 10),
    },
  });

  const mutation = useMutation({
    mutationFn: (values: TransactionForm) =>
      portfolioApi.recordTransaction({
        ...values,
        executed_at: new Date(values.executed_at).toISOString(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio", "holdings"] });
      queryClient.invalidateQueries({ queryKey: ["portfolio", "summary"] });
      reset();
      onClose();
    },
    onError: (err) => setApiError(getApiErrorMessage(err, "Could not record transaction.")),
  });

  const onSubmit = (values: TransactionForm) => {
    setApiError(null);
    mutation.mutate(values);
  };

  const handleClose = () => {
    reset();
    setApiError(null);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="Add transaction"
      description="Record a buy or sell — your holding and P&L update automatically."
    >
      {apiError && <Alert variant="error" className="mb-4">{apiError}</Alert>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="symbol">Symbol</Label>
            <Input
              id="symbol"
              placeholder="AAPL"
              hasError={Boolean(errors.symbol)}
              {...register("symbol")}
            />
            {errors.symbol && <p className="text-xs text-loss">{errors.symbol.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="transaction_type">Type</Label>
            <Select id="transaction_type" {...register("transaction_type")}>
              <option value="BUY">Buy</option>
              <option value="SELL">Sell</option>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="company_name">Company name</Label>
          <Input
            id="company_name"
            placeholder="Apple Inc."
            hasError={Boolean(errors.company_name)}
            {...register("company_name")}
          />
          {errors.company_name && (
            <p className="text-xs text-loss">{errors.company_name.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="sector">Sector</Label>
          <Select id="sector" {...register("sector")} defaultValue="">
            <option value="" disabled>
              Select a sector
            </option>
            {SECTORS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              step="any"
              hasError={Boolean(errors.quantity)}
              {...register("quantity")}
            />
            {errors.quantity && <p className="text-xs text-loss">{errors.quantity.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="price_per_share">Price / share</Label>
            <Input
              id="price_per_share"
              type="number"
              step="any"
              hasError={Boolean(errors.price_per_share)}
              {...register("price_per_share")}
            />
            {errors.price_per_share && (
              <p className="text-xs text-loss">{errors.price_per_share.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="fees">Fees (optional)</Label>
            <Input id="fees" type="number" step="any" {...register("fees")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="executed_at">Date</Label>
            <Input
              id="executed_at"
              type="date"
              hasError={Boolean(errors.executed_at)}
              {...register("executed_at")}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={mutation.isPending}>
            Add transaction
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
