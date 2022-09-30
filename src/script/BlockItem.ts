export class BlockItem extends Laya.View {
  point: Laya.Point;//位置
  isObstacle: boolean;//是否是障碍物
  parentBlock: BlockItem;//父方快
  G: number;//移动花费 可以斜方向移动
  H: number; //从指定的方格移动到终点 B 的预计耗费
  F: number;//总花费
  constructor(pos: Laya.Point, isObstacle: boolean) {
    super();
    this.point = pos;
    this.isObstacle = isObstacle;
    this.width = this.height = 40;
    this.initRect();
  }
  initRect() {
    this.graphics.drawRect(0, 0, 40, 40, this.isObstacle ? "#ff0000" : "#00ff00", "#000000", 1);
  }
  //设置为起点
  setStartPoint() {
    this.graphics.clear();
    this.graphics.drawRect(0, 0, 40, 40, "#0000ff", "#000000", 1);
  }
  //设置为起点
  setEndPoint() {
    this.graphics.clear();
    this.graphics.drawRect(0, 0, 40, 40, "#00ffff", "#000000", 1);
  }
  //恢复
  recyclePoint() {
    this.graphics.clear();
    this.graphics.drawRect(0, 0, 40, 40, this.isObstacle ? "#ff0000" : "#00ff00", "#000000", 1);
  }
  //绘制成路径点
  drawPath() {
    this.graphics.clear();
    this.graphics.drawRect(0, 0, 40, 40, "#000000", "#000000", 1);
  }
}