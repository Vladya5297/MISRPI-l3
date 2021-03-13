import classes from './App.module.css'
import React, { useEffect, useState } from 'react'

const MatrixInput = ({
  rows,
  columns,
  value: initialValue,
  setValue: setInitialValue,
  className,
  ...props
}) => {
  const [value, setValue] = useState('')
  const [isValid, setIsValid] = useState(true)
  const [touched, setTouched] = useState(false)
  const [cols, setCols] = useState(columns)

  const parseValue = (value) => {
    return value.map(row => row.join(' ')).join('\n')
  }

  const processValue = (value) => {
    return value.split('\n').map(
      row => row.split(' ').map(
        num => isNaN(num) ? num : parseFloat(num)
      )
    )
  }

  const validate = (value) => {
    const currentRows = value.split('\n')
    if (rows && currentRows.length !== rows) {
      return false
    }
    if (columns && !currentRows.every(row => row.split(' ').length === columns)) {
      return false
    }
    if (!currentRows.every(row => row.split(' ').every(num => num.match(/^(\d+[.,])?\d+$/)))) {
      return false
    }
    return true
  }

  useEffect(() => {
    const value = Array.isArray(initialValue) ? parseValue(initialValue) : initialValue
    handleCols(value)
    setValue(value)
    const isValid = validate(value)
    setIsValid(isValid)
  }, [initialValue])

  const onBlur = () => {
    !touched && setTouched(true)
    const isValid = validate(value)
    setIsValid(isValid)
    if (value && setInitialValue) {
      setInitialValue(processValue(value))
    }
  }

  const handleCols = (matrix) => {
    const rowsLengths = Array.isArray(matrix)
      ? matrix.map(row => row.join(' ').length)
      : matrix.split('\n').map(row => row.length)
    const cols = Math.max(...rowsLengths)
    setCols(cols)
  }

  const changeHandler = ({ target }) => {
    const { value } = target
    handleCols(value)
    setValue(value)
  }

  return (
    <textarea
      className={`${touched && !isValid ? classes.hasError : ''} ${className}`}
      value={value}
      onChange={changeHandler}
      onBlur={onBlur}
      rows={rows}
      cols={cols}
      {...props}
    />
  )
}

const Header = () => {
  return (
    <>
      <h2>Реализация матричной модели обработки информации в искусственных нейронный сетях</h2>
      <p>Разработчики:</p>
      <ul>
        <li>Овчинникова М. А.</li>
        <li>Ларюшина И. А.</li>
        <li>Комиссарова Е. Г.</li>
        <li>Кувшинов В. Л.</li>
      </ul>
      <hr />
    </>
  )
}

const App = () => {
  const [size, setSize] = useState(5)
  const [vector, setVector] = useState([])
  const [W, setW] = useState([])
  const [V, setV] = useState([])
  const [Net1, setNet1] = useState([])
  const [Net2, setNet2] = useState([])
  const [Out1, setOut1] = useState([])
  const [Out2, setOut2] = useState([])
  const [auto, setAuto] = useState(true)

  useEffect(() => {
    const createMatrix = (value) => {
      const row = Array.from({ length: size }).fill(value)
      return Array.from({ length: size }).fill(row)
    }

    const value = auto ? parseFloat((1 / size).toFixed(3)) : 0
    setW(createMatrix(value))
    setV(createMatrix(value))
  }, [auto, size])

  const computeNet = (vector, matrix) => {
    if (vector.length !== size || matrix.length !== size) return[]
    const result = Array.from({ length: vector.length }).fill(0)
    for (let i = 0; i < vector.length; i++) {
      for (let j = 0; j < matrix.length; j++) {
        const vecElem = vector[i]
        const matrElem = matrix[j][i]
        if (typeof vecElem !== 'number' || typeof matrElem !== 'number') return []
        result[i] += vecElem * matrElem
      } 
    }
    return result
  }

  const computeOut = (net) => {
    return net.map(num => 1 / (1 + Math.pow(Math.E, -num)))
  }

  useEffect(() => {
    setNet1(computeNet(vector.map(([num]) => num), W))
  }, [vector, W])

  useEffect(() => {
    setOut1(computeOut(Net1))
  }, [Net1])

  useEffect(() => {
    setNet2(computeNet(Out1, V))
  }, [Out1, V])

  useEffect(() => {
    setOut2(computeOut(Net2))
  }, [Net2])

  const ResultColumn = ({ title, result }) => {
    return (
      <div>
        {title}
        <div className={classes.net}>
          {result.map(num => <div>{parseFloat(num.toFixed(3))}</div>)}
        </div>
      </div>
    )
  }

  return (
    <>
      <Header />
      <div className={classes.wrapper}>
        <div>
          Вектор
          <MatrixInput
            rows={size}
            columns={1}
            className={classes.matrix}
            value={vector}
            setValue={setVector}
            style={{ maxWidth: '50px'}}
          />
        </div>
        <div>
          Матрица W
          <MatrixInput
            rows={size}
            columns={size}
            className={classes.matrix}
            value={W}
            setValue={setW}
            readOnly={auto}
          />
        </div>
        <ResultColumn title='NET1' result={Net1} />
        <ResultColumn title='OUT1' result={Out1} />
        <div>
          Матрица V
          <MatrixInput
            rows={size}
            columns={size}
            className={classes.matrix}
            value={V}
            setValue={setV}
            readOnly={auto}
          />
        </div>
        <ResultColumn title='NET2' result={Net2} />
        <ResultColumn title='OUT2' result={Out2} />
      </div>
      <div className={classes.offsetWrapper}>
        <span>Размер</span>
        <input
          type='number'
          className={classes.sizeInput}
          min={1}
          value={size}
          onChange={({ target }) => { setSize(Number(target.value)) }}
        />
        <span>Автоматическое заполнение</span>
        <input
          type='checkbox'
          checked={auto}
          onChange={({ target }) => { setAuto(target.checked) }}
        />
      </div>
    </>
  )
}

export default App
