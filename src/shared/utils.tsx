import type { LoaderFunction } from "react-router-dom";
import {
  Await as AwaitRR,
  defer as deferRR,
  useLoaderData as useLoaderDataRR,
} from "react-router-dom";

export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const useLoaderData = <Loader extends LoaderFunction>() =>
  useLoaderDataRR() as Awaited<ReturnType<Loader>>;

export const useDeferredLoaderData = <LoaderData extends ReturnType<typeof defer>>() =>
  useLoaderDataRR() as LoaderData["data"];

export const defer = <Data extends Record<string, unknown>>(data: Data) =>
  deferRR(data) as Omit<ReturnType<typeof deferRR>, "data"> & {
    data: Data;
  };

export interface AwaitResolveRenderFunction<T> {
  (data: Awaited<T>): React.ReactElement;
}

export interface AwaitProps<T> {
  children: React.ReactNode | AwaitResolveRenderFunction<T>;
  errorElement?: React.ReactNode;
  resolve: Promise<T>;
}

export const Await = <T,>(props: AwaitProps<T>) => <AwaitRR {...props} />;
