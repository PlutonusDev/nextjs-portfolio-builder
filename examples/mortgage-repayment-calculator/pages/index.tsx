import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";

export default function Home() {
  const [mortgageType, setMortgageType] = useState("");
  const [repayments, setRepayments] = useState(null);

  const mortgageSchema = Yup.object().shape({
    principleAmount: Yup.string()
      .required(),
    term: Yup.string()
      .required(),
    interestRate: Yup.string()
      .required()
  });
  const { register, handleSubmit, formState, setValue, reset } = useForm({ resolver: yupResolver(mortgageSchema) });
  const { errors } = formState;

  async function processMortgageRepayments(data) {
    const principleAmount = Number(data.principleAmount.replace(/,/g, ''));
    const term = Number(data.term.replace(/,/g, ''));
    const interestRate = Number(parseFloat(data.interestRate.replace(/,/g, '')));
    const monthlyInterestRate = interestRate / 100 / 12;
    const numberOfPayments = term * 12;

    let monthlyRepayments;
    let annualRepayments;
    let totalPaid;

    if (mortgageType === "repayment") {
      monthlyRepayments = (
        principleAmount *
        (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) /
        (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1)
      );
      annualRepayments = (monthlyRepayments * 12);
      totalPaid = (monthlyRepayments * numberOfPayments);
    } else if (mortgageType === "interestonly") {
      monthlyRepayments = (principleAmount * monthlyInterestRate);
      annualRepayments = (monthlyRepayments * 12);
      totalPaid = (monthlyRepayments * numberOfPayments + principleAmount);
    }

    setRepayments({ monthlyRepayments, annualRepayments, totalPaid });
  }

  return (
    <div className="md:flex md:justify-center md:items-center h-screen w-full bg-slate-100">
      <div className="w-full md:max-w-5xl md:rounded-2xl overflow-hidden bg-white shadow-xl md:flex">
        <form onSubmit={handleSubmit(processMortgageRepayments)} className="p-8 md:w-1/2">
          <div className="flex-wrap items-center md:justify-between">
            <p className="text-slate-900 font-bold text-xl">Mortgage Calculator</p>
            <a onClick={() => { reset(); setMortgageType(""); setRepayments(null); }} className="cursor-pointer text-slate-500 text-sm font-semibold underline hover:text-slate-300">Clear All</a>
          </div>
          <div className="pt-8 flex flex-col space-y-2">
            <p className="text-slate-500 text-xs font-semibold">Mortgage Amount</p>
            <div className="flex rounded-md overflow-hidden group border-2 border-slate-300 focus-within:border-lime">
              <div className="py-2 px-3 bg-slate-100 text-sm text-slate-500 font-semibold group-focus-within:text-slate-700 group-focus-within:bg-lime">
                $
              </div>
              <input {...register("principleAmount")} onChange={e => setValue("principleAmount", (Number(Math.abs(parseFloat(e.target.value.replace(/[,.]/g, '')))) || 0).toLocaleString('en', { maximumFractionDigits: 0 }))} className="w-full border-0 focus:ring-0 px-2 text-sm font-semibold text-slate-700" />
            </div>
          </div>
          <div className="flex gap-x-4">
            <div className="w-1/2 pt-6 flex flex-col space-y-2">
              <p className="text-slate-500 text-xs font-semibold">Mortgage Term</p>
              <div className="flex rounded-md overflow-hidden group border-2 border-slate-300 focus-within:border-lime">
                <input {...register("term")} onChange={e => setValue("term", (Number(Math.abs(parseFloat(e.target.value.replace(/[,]/g, '')))) || 0).toLocaleString('en', { maximumFractionDigits: 2 }))} className="w-full border-0 focus:ring-0 px-2 text-sm font-semibold text-slate-700" />
                <div className="py-2 px-3 bg-slate-100 text-sm text-slate-500 font-semibold group-focus-within:text-slate-700 group-focus-within:bg-lime">
                  years
                </div>
              </div>
            </div>
            <div className="w-1/2 pt-6 flex flex-col space-y-2">
              <p className="text-slate-500 text-xs font-semibold">Interest Rate</p>
              <div className="flex rounded-md overflow-hidden group border-2 border-slate-300 focus-within:border-lime">
                <input {...register("interestRate")} onChange={e => {
                  if (e.target.value.split('.').length - 1 > 1) e.target.value = e.target.value.substring(0, e.target.value.indexOf('.', e.target.value.indexOf('.') + 1));
                  !e.target.value.endsWith(".") && setValue("interestRate", (Number(Math.abs(parseFloat(e.target.value.replace(/[,]/g, '')))) || 0).toLocaleString('en', { maximumFractionDigits: 3 }))
                }} className="w-full border-0 focus:ring-0 px-2 text-sm font-semibold text-slate-700" />
                <div className="py-2 px-3 bg-slate-100 text-sm text-slate-500 font-semibold group-focus-within:text-slate-700 group-focus-within:bg-lime">
                  %
                </div>
              </div>
            </div>
          </div>
          <div className="pt-8 flex flex-col space-y-2">
            <p className="text-slate-500 text-xs font-semibold">Mortgage Type</p>
            <div className="flex-col space-y-2">
              <div className="relative flex">
                <input onChange={e => setMortgageType(e.target.value)} checked={mortgageType === "repayment"} id="mortgage-type-repayment" type="radio" value="repayment" className="hidden peer" />
                <div className="absolute top-1/2 -translate-y-1/2 left-4 w-3 h-3 shrink-0 rounded-full peer-checked:bg-lime ring-1 ring-offset-2 ring-slate-500 peer-checked:ring-lime" />
                <label htmlFor="mortgage-type-repayment" className="relative flex flex-grow rounded-md items-center ps-4 space-x-3 border-2 border-slate-300 peer-checked:border-lime peer-checked:bg-lime/20 peer">
                  <span className="ps-5 py-2 w-full text-slate-900 text-sm font-semibold tracking-wide">Repayment</span>
                </label>
              </div>
              <div className="relative flex">
                <input onChange={e => setMortgageType(e.target.value)} checked={mortgageType === "interestonly"} id="mortgage-type-interestonly" type="radio" value="interestonly" className="hidden peer" />
                <div className="absolute top-1/2 -translate-y-1/2 left-4 w-3 h-3 shrink-0 rounded-full peer-checked:bg-lime ring-1 ring-offset-2 ring-slate-500 peer-checked:ring-lime" />
                <label htmlFor="mortgage-type-interestonly" className="relative flex flex-grow rounded-md items-center ps-4 space-x-3 border-2 border-slate-300 peer-checked:border-lime peer-checked:bg-lime/20 peer">
                  <span className="ps-5 py-2 w-full text-slate-900 text-sm font-semibold tracking-wide">Interest Only</span>
                </label>
              </div>
            </div>
          </div>
          <div className="pt-8">
            <button className="bg-lime text-slate-900 flex items-center space-x-2 px-8 py-3 rounded-full hover:bg-lime/70 transition-colors">
              <img className="w-4" src="/img/icon-calculator.svg" alt="Calculator" />
              <span className="text-sm font-semibold">Calculate Repayments</span>
            </button>
          </div>
        </form>
        <div className="md:w-1/2 bg-slate-900 md:rounded-bl-[64px]">
          {repayments ? (
            <div className="p-8">
              <p className="text-slate-100 font-bold text-xl">Your results</p>
              <p className="text-slate-300 text-sm">
                Your results are shown below based on the information you
                provided. To adjust the results, edit the form and click
                "calculate repayments" again.
              </p>
              <div className="relative p-8 mt-8 rounded-lg overflow-hidden border-t-4 border-lime bg-slate-extra">
                <div className="flex flex-col space-y-4">
                  <p className="text-slate-300 text-sm font-semibold tracking-wide">
                    Your monthly repayments
                  </p>
                  <p className="text-5xl font-bold text-lime">${Number(parseFloat(repayments.monthlyRepayments)).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                <div className="h-[1px] w-full bg-slate-700 my-8" />
                <div className="flex flex-col space-y-2">
                  <p className="text-slate-300 text-sm font-semibold tracking-wide">
                    Total you'll repay over the term
                  </p>
                  <p className="text-2xl font-bold text-white">${Number(parseFloat(repayments.totalPaid)).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 flex flex-col h-full items-center justify-center space-y-2">
              <img className="w-1/2" src="/img/illustration-empty.svg" alt="Calculator" />
              <p className="text-slate-100 tracking-wide text-lg font-semibold">Results shown here</p>
              <p className="text-slate-300 text-xs text-center">
                Complete the form and click "calculate repayments" to see
                what your monthly repayments would be.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}