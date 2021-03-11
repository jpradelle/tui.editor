import {
  NodeType,
  MarkType,
  Schema,
  ProsemirrorNode,
  Mark,
  DOMOutputSpecArray,
} from 'prosemirror-model';
import { MdNode, MdNodeType } from '@toast-ui/toastmark';
import { WwNodeType, WwMarkType } from './wysiwyg';

export type Attrs = { [name: string]: any } | null;

export interface StackItem {
  type: NodeType;
  attrs: Attrs | null;
  content: ProsemirrorNode[];
}

export interface ToWwConvertorState {
  schema: Schema;
  top(): StackItem;
  push(node: ProsemirrorNode): void;
  addText(text: string): void;
  openMark(mark: Mark): void;
  closeMark(mark: MarkType): void;
  addNode(type: NodeType, attrs?: Attrs, content?: ProsemirrorNode[]): ProsemirrorNode | null;
  openNode(type: NodeType, attrs?: Attrs): void;
  closeNode(): ProsemirrorNode | null;
  convertNode(mdNode: MdNode): ProsemirrorNode | null;
  convertByDOMParser(root: HTMLElement): void;
}

type ToWwConvertor = (
  state: ToWwConvertorState,
  node: MdNode,
  context: {
    entering: boolean;
    skipChildren: () => void;
  }
) => void;

export type ToWwConvertorMap = Partial<Record<string, ToWwConvertor>>;

export type FirstDelimFn = (index: number) => string;

export interface ToMdConvertorState {
  stopNewline: boolean;
  inTable: boolean;
  flushClose(size?: number): void;
  wrapBlock(delim: string, firstDelim: string | null, node: ProsemirrorNode, fn: () => void): void;
  ensureNewLine(): void;
  write(content?: string): void;
  closeBlock(node: ProsemirrorNode): void;
  text(text: string, escaped?: boolean): void;
  convertBlock(node: ProsemirrorNode, parent: ProsemirrorNode, index: number): void;
  convertInline(parent: ProsemirrorNode): void;
  convertList(node: ProsemirrorNode, delim: string, firstDelimFn: FirstDelimFn): void;
  convertTableCell(node: ProsemirrorNode): void;
  convertNode(parent: ProsemirrorNode): string;
}

export interface ToDOMAdaptor {
  getToDOM(type: string): ((node: ProsemirrorNode | Mark) => DOMOutputSpecArray) | null;
  getToDOMNode(type: string): ((node: ProsemirrorNode | Mark) => Node) | null;
}

type HTMLToWwConvertor = (state: ToWwConvertorState, node: MdNode, openTagName: string) => void;

export type HTMLToWwConvertorMap = Partial<Record<string, HTMLToWwConvertor>>;

export interface FlattenHTMLToWwConvertorMap {
  [k: string]: HTMLToWwConvertor;
}

export interface NodeInfo {
  node: ProsemirrorNode;
  parent?: ProsemirrorNode;
  index?: number;
}

export interface MarkInfo {
  node: Mark;
  parent?: ProsemirrorNode;
  index?: number;
}

interface ToMdConvertorReturnValues {
  delim?: string | string[];
  rawHTML?: string | string[] | null;
  text?: string;
  attrs?: Attrs;
}

type ToMdNodeTypeWriter = (
  state: ToMdConvertorState,
  nodeInfo: NodeInfo,
  params: ToMdConvertorReturnValues
) => void;

export type ToMdNodeTypeWriterMap = Partial<Record<WwNodeType, ToMdNodeTypeWriter>>;

interface ToMdMarkTypeOption {
  mixable?: boolean;
  removedEnclosingWhitespace?: boolean;
  escape?: boolean;
}

export type ToMdMarkTypeOptions = Partial<Record<WwMarkType, ToMdMarkTypeOption | null>>;

type ToMdNodeTypeConvertor = (state: ToMdConvertorState, nodeInfo: NodeInfo) => void;

export type ToMdNodeTypeConvertorMap = Partial<Record<WwNodeType, ToMdNodeTypeConvertor>>;

type ToMdMarkTypeConvertor = (
  nodeInfo?: MarkInfo,
  entering?: boolean
) => ToMdConvertorReturnValues & ToMdMarkTypeOption;

export type ToMdMarkTypeConvertorMap = Partial<Record<WwMarkType, ToMdMarkTypeConvertor>>;

interface ToMdConvertorContext {
  origin?: () => ReturnType<ToMdConvertor>;
  entering?: boolean;
  inTable?: boolean;
}

type ToMdConvertor = (
  nodeInfo: NodeInfo | MarkInfo,
  context: ToMdConvertorContext
) => ToMdConvertorReturnValues;

export type ToMdConvertorMap = Partial<Record<WwNodeType | MdNodeType, ToMdConvertor>>;

export interface ToMdConvertors {
  nodeTypeConvertors: ToMdNodeTypeConvertorMap;
  markTypeConvertors: ToMdMarkTypeConvertorMap;
}
