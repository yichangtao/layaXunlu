import { BlockItem } from "./blockItem";
import { ui } from "../ui/layaMaxUI";
export class StartUI extends ui.StartUI {
  private allBlock: BlockItem[][];//所有方块
  private startPoint: BlockItem;
  private endPoint: BlockItem;
  private setStartPot: boolean = false;
  private setEndPot: boolean = false;
  private setObstPot: boolean = false;
  constructor() {
    super();
    // Laya.Scene.open(`Start.scene`);
    this.onload();
  }
  onAwake() {
    this.btnChoose.on(Laya.Event.CLICK, this, this.refreshChoose);
    this.btnStart.on(Laya.Event.CLICK, this, this.setStart);
    this.btnEnd.on(Laya.Event.CLICK, this, this.setEnd);
    this.btnSetObs.on(Laya.Event.CLICK, this, this.setObs)
    this.btnFind.on(Laya.Event.CLICK, this, this.startFind);
  }
  onload() {
    this.width = Laya.stage.width;
    this.height = Laya.stage.height;
    Laya.stage.addChild(this);
    let box = new Laya.Box();
    box.width = box.height = 100;
    box.pos(100, 200)
    this.addChild(box);
    this.allBlock = [];
    for (let i = 0; i < 10; i++) {
      let rowBlock = [];
      for (let j = 0; j < 10; j++) {
        let bolckItem;
        bolckItem = new BlockItem(new Laya.Point(i, j), false);
        bolckItem.pos(i * 40, j * 40);
        bolckItem.on(Laya.Event.CLICK, this, this.setPoint, [bolckItem]);
        box.addChild(bolckItem);
        rowBlock.push(bolckItem);
      }
      this.allBlock.push(rowBlock);
    }
    console.log("初始化格子完毕");

  }
  setPoint(bolckItem: BlockItem) {
    if (this.setStartPot) {
      this.startPoint && this.startPoint.initRect();
      this.startPoint = bolckItem;
      bolckItem.setStartPoint();
      this.lbStart.text = bolckItem.point.x + "," + bolckItem.point.y;
    } else if (this.setEndPot) {
      this.endPoint && this.endPoint.initRect();
      this.endPoint = bolckItem;
      bolckItem.setEndPoint();
      this.lbEnd.text = bolckItem.point.x + "," + bolckItem.point.y
    } else if (this.setObstPot) {
      bolckItem.isObstacle = true;
      bolckItem.initRect();
    } else {
      return;
    }
  }
  //重新选择点位 
  refreshChoose() {
    this.lbStart.text = '';
    this.lbEnd.text = '';
    if (this.startPoint) {
      this.startPoint.recyclePoint();
      this.startPoint = null;
    }
    if (this.endPoint) {
      this.endPoint.recyclePoint();
      this.endPoint = null;
    }
    this.allBlock.forEach(v => v.forEach(item => {
      item.isObstacle = false;
      item.initRect();
    }))
    this.setStartPot = this.setEndPot = this.setObstPot = false;
    this.lbTips.text = '';
  }
  //设置起点
  setStart() {
    this.setStartPot = true;
    this.setEndPot = this.setObstPot = false;
  }
  //设置终点
  setEnd() {
    this.setStartPot = this.setObstPot = false;
    this.setEndPot = true;
  }
  //设置障碍点
  setObs() {
    this.setStartPot = this.setEndPot = false;
    this.setObstPot = true;
  }
  //开始寻路
  startFind() {
    if (!this.startPoint || !this.endPoint) return;
    let result = this.findPath();
    if (!result.length) {
      this.lbTips.text = "没有路径！！！";
      return;
    }
    this.lbTips.text = '';
    for (let i = 0; i < result.length; i++) {
      let block = result[i];
      block.drawPath();
    }
  }
  /**
   * 寻找最佳路径
   */
  findPath() {
    let openList: BlockItem[] = [];//开启列表
    let closeList: BlockItem[] = [];//关闭列表
    let result: BlockItem[] = [];//结果数组
    this.startPoint.G = 0;//设置初始点位的移动花费为0；
    openList.push(this.startPoint);//将出发点放入开启列表中
    do {
      let currentPoint = openList.pop();//
      closeList.push(currentPoint);
      let surroundPoint = this.SurroundPoint(currentPoint);//周围8个点的坐标
      for (let i = 0; i < surroundPoint.length; i++) {
        let item = surroundPoint[i];
        let block = this.allBlock[item.x] ? this.allBlock[item.x][item.y] : undefined;
        //判断点是否存在 是否是障碍物 是否在关闭列表里 格子中间是否有障碍物
        if (block && !block.isObstacle && closeList.indexOf(block) == -1 && !this.allBlock[currentPoint.point.x][item.y].isObstacle
          && !this.allBlock[item.x][currentPoint.point.y].isObstacle) {
          let g = currentPoint.G + ((currentPoint.point.x - block.point.x) * (currentPoint.point.y - block.point.y) == 0 ? 10 : 14);
          //不在开启列表里 计算该点的 h g f的值 将当前点设置为该点的父元素 放入开启列表中
          if (openList.indexOf(block) == -1) {
            block.H = Math.abs(this.endPoint.point.x - block.point.x) * 10 + Math.abs(this.endPoint.point.y - block.point.y) * 10;
            block.G = g;
            block.F = block.H + g;
            block.parentBlock = currentPoint;
            openList.push(block);
          }
          //在开启列表中 计算g的值 如果g值更小 就将该点的父元素设置为当前点
          else {
            if (g < block.G) {
              block.parentBlock = currentPoint;
              block.G = g;
              block.F = block.H + g;
            }
          }
        }
      }
      //如果开启列表为空 证明没有路径
      if (openList.length == 0) {
        break;
      }
      //根据总的花费进行排序 为了循环回去的时候，找出 F 值最小的, 将它从 "开启列表" 中移掉
      openList.sort((a, b) => b.F - a.F);
    } while (openList.indexOf(this.endPoint) == -1);
    //结果是否为空
    let result_index = openList.indexOf(this.endPoint);
    if (result_index < 0) {
      result = [];
    } else {
      let currentObj = openList[result_index].parentBlock;
      do {
        result.unshift(currentObj);
        currentObj = currentObj.parentBlock;
      } while (currentObj != this.startPoint);
    }
    return result;
  }
  SurroundPoint(currentPoint: BlockItem) {
    let x = currentPoint.point.x;
    let y = currentPoint.point.y;
    return [
      { x: x, y: y - 1 },
      { x: x - 1, y: y },
      { x: x + 1, y: y },
      { x: x, y: y + 1 },
      // { x: x - 1, y: y + 1 },
      // { x: x + 1, y: y - 1 },
      // { x: x - 1, y: y - 1 },
      // { x: x + 1, y: y + 1 },
    ]
  }
}