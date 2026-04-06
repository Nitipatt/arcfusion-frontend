import React, { useState, useEffect } from "react";

const dynamic = (loader: () => Promise<{ default: React.ComponentType }>) => {
  const DynamicComponent = (props: Record<string, unknown>) => {
    const [Component, setComponent] = useState<React.ComponentType | null>(null);
    useEffect(() => {
      loader().then((mod: { default: React.ComponentType }) => setComponent(() => mod.default));
    }, []);
    return Component ? <Component {...props} /> : <div data-testid="dynamic-loading">Loading...</div>;
  };
  DynamicComponent.displayName = "DynamicComponent";
  return DynamicComponent;
};

export default dynamic;
