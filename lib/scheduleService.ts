export const getData = async () => {
  const res = await fetch("/data.json");
  const data = await res.json();
  console.log(data);
};


export const displayLogic = async () => {
    
}

