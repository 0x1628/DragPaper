import { IRouterContext } from "koa-router";

export function login(ctx: IRouterContext) {
  console.log(ctx.body)
}