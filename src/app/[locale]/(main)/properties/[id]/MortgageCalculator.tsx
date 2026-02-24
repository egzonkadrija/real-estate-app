"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { calculateMortgage, formatPrice } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface MortgageCalculatorProps {
  price: number;
}

export function MortgageCalculator({ price }: MortgageCalculatorProps) {
  const t = useTranslations("property");
  const [downPayment, setDownPayment] = useState(Math.round(price * 0.2));
  const [interestRate, setInterestRate] = useState(3.5);
  const [years, setYears] = useState(25);

  const loanAmount = Math.max(0, price - downPayment);
  const monthlyPayment = calculateMortgage(loanAmount, interestRate, years);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Down Payment
          </label>
          <Input
            type="number"
            value={downPayment}
            onChange={(e) => setDownPayment(Number(e.target.value))}
            min={0}
            max={price}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Interest Rate (%)
          </label>
          <Input
            type="number"
            value={interestRate}
            onChange={(e) => setInterestRate(Number(e.target.value))}
            min={0}
            max={20}
            step={0.1}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Years
          </label>
          <Input
            type="number"
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            min={1}
            max={40}
          />
        </div>
      </div>
      <div className="rounded-lg bg-blue-50 p-4 text-center">
        <p className="text-sm text-gray-600">{t("monthlyPayment")}</p>
        <p className="text-2xl font-bold text-blue-600">
          {formatPrice(Math.round(monthlyPayment))}
        </p>
      </div>
    </div>
  );
}
