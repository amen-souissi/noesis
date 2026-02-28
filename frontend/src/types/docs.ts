export interface ModuleSummary {
  slug: string;
  name: string;
  source_file: string;
  category: string;
  order: number;
  short_description: string;
}

export interface RelatedLesson {
  title: string;
  path: string;
  phase: string;
  step: number;
  note?: string;
}

export interface ClassParam {
  name: string;
  type: string;
  description: string;
  default?: string;
}

export interface ClassMethod {
  name: string;
  signature: string;
  description: string;
  returns?: string;
}

export interface ClassInterface {
  class_name: string;
  parent_class: string | null;
  constructor: ClassParam[];
  methods: ClassMethod[];
  properties: ClassParam[];
}

export interface ModuleDetail extends ModuleSummary {
  purpose: string;
  math_formulas: { name: string; latex: string; explanation: string }[];
  key_shapes: Record<string, string>;
  data_flow: {
    previous: string | null;
    next: string | null;
    receives_from: string;
    sends_to: string;
  };
  code_example: string;
  educational_notes: string;
  related_lessons?: RelatedLesson[];
  class_interface?: ClassInterface;
}

export interface DataFlow {
  nodes: { id: string; label: string; x: number; y: number }[];
  edges: { from: string; to: string; label: string }[];
}
