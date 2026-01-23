import { ToolNode } from "@langchain/langgraph/prebuilt";
import {  list_files, make_dir, read_file, run_command, write_file,get_url,run_command_background } from "./tools";


export const tools = [
  read_file, 
  write_file, 

  list_files, 
  make_dir, 
  run_command, 
  get_url, 
  run_command_background
];


export const toolNode = new ToolNode(tools);