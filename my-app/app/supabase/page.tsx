import { createClient } from "@/lib/supabase/server";

export default async function Page() {
  // 1. Initialize the client (await is required because your server.ts is async)
  const supabase = await createClient();

  // 2. TEST READ: Attempt to fetch data from the 'session' table
  // Even if the table is empty, a successful connection will return data: [] (empty array)
  // If the connection fails, 'error' will be populated.
  const { data: sessions, error: dbError } = await supabase
    .from("sessions") 
    .select("*")
    .limit(5);

  // 3. TEST AUTH: Check if the server can reach the Auth service
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  return (
    <div className="p-12 space-y-6 font-mono">
      <h1 className="text-2xl font-bold">Database Connection Test</h1>

      {/* Database Status Section */}
      <section className="p-4 border rounded bg-slate-50">
        <h2 className="font-bold mb-2">1. Database Connection (Read Operation)</h2>
        {dbError ? (
          <div className="text-red-600">
            <p>❌ Connection Failed</p>
            <pre className="text-xs mt-2">{JSON.stringify(dbError, null, 2)}</pre>
          </div>
        ) : (
          <div className="text-green-600">
            <p>✅ Connection Successful!</p>
            <p className="text-sm text-gray-600">
              Rows found: {sessions?.length || 0}
            </p>
            {/* Show raw data if any exists */}
            {sessions && sessions.length > 0 && (
              <pre className="text-xs text-black mt-2 bg-gray-100 p-2 rounded">
                {JSON.stringify(sessions, null, 2)}
              </pre>
            )}
          </div>
        )}
      </section>

      {/* Auth Status Section */}
      <section className="p-4 border rounded bg-slate-50">
        <h2 className="font-bold mb-2">2. Auth Service Status</h2>
        {authError ? (
           // Note: "Auth session missing" is NOT a connection error, it just means you aren't logged in.
           // Real connection errors usually say "fetch failed".
           <div className="text-orange-600">
             <p>⚠️ Auth Check (Not Logged In or Error)</p>
             <pre className="text-xs mt-2">{authError.message}</pre>
           </div>
        ) : (
          <div className="text-green-600">
             <p>✅ Logged In</p>
             <p className="text-sm">User Email: {user?.email}</p>
          </div>
        )}
      </section>
    </div>
  );
}