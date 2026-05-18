"use client";

import { ReactNode } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EditableListProps {
  title: string;
  description?: string;
  onAdd: () => void;
  children: ReactNode;
}

export function EditableList({ title, description, onAdd, children }: EditableListProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-lg">{title}</CardTitle>
          {description ? <p className="mt-1 text-xs text-slate-300">{description}</p> : null}
        </div>
        <Button variant="secondary" size="sm" onClick={onAdd}>
          <Plus className="mr-1 h-4 w-4" />
          新增
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}
