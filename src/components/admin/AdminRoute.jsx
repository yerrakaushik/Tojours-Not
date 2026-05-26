import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import AdminPasswordPrompt from './AdminPasswordPrompt';

const AdminRoute = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isPasswordVerified, setIsPasswordVerified] = useState(
    localStorage.getItem('admin_verified') === 'true'
  );

  useEffect(() => {
    async function checkAdmin() {
      try {
        // Step 1: Check if user is authenticated
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          console.warn('AdminRoute: User not authenticated');
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        setIsAuthenticated(true);

        // Step 2: Check admin role using the SECURITY DEFINER RPC function
        // This avoids ALL RLS issues — the function runs as postgres and
        // directly checks the profiles table, bypassing any policy conflicts.
        const { data: adminCheck, error: rpcError } = await supabase
          .rpc('is_admin');

        if (rpcError) {
          console.error('AdminRoute: is_admin() RPC error:', rpcError.message);
          // Fallback: try direct query with .limit(1) to handle duplicate rows
          // from overlapping SELECT policies
          const { data: rows, error: fallbackError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .eq('role', 'admin')
            .limit(1);

          if (!fallbackError && rows && rows.length > 0) {
            setIsAdmin(true);
          }
        } else {
          // RPC returns true/false directly
          setIsAdmin(adminCheck === true);
        }
      } catch (error) {
        console.error('AdminRoute: Unexpected error:', error);
      } finally {
        setIsLoading(false);
      }
    }
    checkAdmin();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-creamy-vanilla flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blossom-pink border-t-transparent rounded-full animate-spin" />
          <p className="font-quicksand font-bold text-charcoal-berry/60">Verifying privileges...</p>
        </div>
      </div>
    );
  }

  // Not logged in → redirect to auth
  if (!isAuthenticated) return <Navigate to="/auth" replace />;

  // Logged in but not admin → redirect home
  if (!isAdmin) return <Navigate to="/" replace />;

  // Admin but needs password verification
  if (!isPasswordVerified) {
    return <AdminPasswordPrompt onVerify={setIsPasswordVerified} />;
  }

  return children;
};

export default AdminRoute;
