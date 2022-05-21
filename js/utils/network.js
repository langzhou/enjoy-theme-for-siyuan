/**
 * 设置属性
 * @param {object} data 
 * @returns 
 */
 export function setBlockAttrs(data){
  return request("/api/attr/setBlockAttrs",data)
}

/**
 * 
 * @param {obj} data 示例：{
  "dataType": "markdown",
  "data": "foo**bar**{: style=\"color: var(--b3-font-color8);\"}baz",
  "previousID": "20211229114650-vrek5x6"
}
 * @returns 
 */
export function insertBlock(data){
  return request("/api/block/insertBlock", data)
}

export function prependBlock(data) {
  return request("/api/block/prependBlock", data)
}

/**
 * 
 * @param {obj} data 
 * @returns 
 */
export function appendBlock(data) {
  return request("/api/block/appendBlock", data)
}

export function updateBlock(data) {
  return request("/api/block/updateBlock", data)
}

export function deleteBlock(id) {
  return request("/api/block/deleteBlock", { "id": id })
}

export function querySQL(sql){
  return request("/api/query/sql",{ "stmt": sql })
}

/**
 * 网络请求
 * @param {*} url 请求地址
 * @param {object} data 
 * @param {*} method 请求方法 get post
 * @returns 
 */
export function request(url,data,method='POST'){
  return new Promise((resolve, reject)=>{
    if(method.toUpperCase() == 'POST'){
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.74 Safari/537.36'
        },
        body: JSON.stringify(data)
      }).then(handleResponse)
        .then(data  => resolve(data))
        .then(error => reject(error))

    }else{
      fetch(url,{
        method: 'GET',
        headers:{
          'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.74 Safari/537.36'
        }
      })
      .then(handleResponse)
      .then(data  => resolve(data))
      .then(error => reject(error))
    }
  })

  function handleResponse (response) {
    let contentType = response.headers.get('content-type')
    if (contentType.includes('application/json')) {
      return handleJSONResponse(response)
    } else if (contentType.includes('text/html')) {
      return handleTextResponse(response)
    } else {
      throw new Error(`Sorry, content-type ${contentType} not supported`)
    }
  }

  function handleJSONResponse (response) {
    return response.json()
      .then(json => {
        if (response.ok) {
          return json
        } else {
          return Promise.reject(Object.assign({}, json, {
            status: response.status,
            statusText: response.statusText
          }))
        }
      })
  }
  function handleTextResponse (response) {
    return response.text()
      .then(text => {
        if (response.ok) {
          return text
        } else {
          return Promise.reject({
            status: response.status,
            statusText: response.statusText,
            err: text
          })
        }
      })
  }
}
