import { login } from "./actions";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <div className="flex-1 flex items-center justify-center px-6">
      <form action={login} className="max-w-sm w-full rounded-xl border bg-white p-6 space-y-3">
        <h1 className="font-semibold text-lg">Admin login</h1>
        <input
          type="password"
          name="password"
          placeholder="Password"
          className="w-full rounded border px-3 py-2 text-sm"
          required
        />
        {error && <p className="text-sm text-red-600">Wrong password.</p>}
        <button className="w-full rounded-full bg-black text-white py-2 text-sm font-medium">
          Log in
        </button>
      </form>
    </div>
  );
}
